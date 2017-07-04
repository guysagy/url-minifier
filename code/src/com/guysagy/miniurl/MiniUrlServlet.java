package com.guysagy.miniurl;

import java.io.BufferedReader;
import java.io.IOException;
import java.lang.System;
import java.net.URLEncoder;
import java.util.regex.Pattern;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.common.base.Charsets;
import com.google.common.io.BaseEncoding;
import com.google.common.io.BaseEncoding.DecodingException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@SuppressWarnings({ "serial", "unused" })

public class MiniUrlServlet extends HttpServlet {

    private MminiUrlsStorge miniUrlsStorge = new MminiUrlsStorge();
    private boolean isDebugMode = false;

    private class ValidationResult {
        private ValidationResult(boolean isValid, String reason) {
            this.isValid = isValid;
            this.reason = reason;
        }
        public String toString() {
            return "ValidationResult: isValid = " + isValid + " reason = " + reason;
        }
        private boolean isValid;
        private String reason;
    }

    //
    // Handler for minified Urls Get requests ; shall redirect to the long Url. 
    //
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException  {

    	// Initialize to a default value:
        String redirectTo = BuildServerHttpLocation(req) + "index.html#!/miniUrlNotFound";

        try {

            isDebugMode = req.getServerName().contains("localhost");

            // Parameter that identifies whether we got here by a click on an anchor tag within our own front end. 
            // In that case, there is no need to invoke the URL safe browsing check on the client side.
            String client = req.getParameter("client");

            // http://docs.oracle.com/javaee/6/api/javax/servlet/http/HttpServletRequest.html#getRequestURI()
            // Remove the leading "/" of the URI:
            String minifiedUrlCode = req.getRequestURI().substring(1).trim();

            // http://google.github.io/guava/releases/22.0-android/api/docs/
            // decode(...) returns an array of ASCII codes. 
            byte[] decodedMinifiedUrlCode = BaseEncoding.base32().decode(minifiedUrlCode);

            // Convert the array of ASCII codes to a String.
            // TODO : check whether these is a library method that would do this instead of my implementation.
            String minifiedUrlRowIdAsString = "";
            for(byte urlByte: decodedMinifiedUrlCode){
                minifiedUrlRowIdAsString += Character.toString((char)urlByte);
            }

            // The string is actually an integer, returned previously by miniUrlsStorge.insertUrl(...):
            Integer minifiedUrlRowId = Integer.parseInt(minifiedUrlRowIdAsString);
            String longUrl = miniUrlsStorge.getLongUrl(minifiedUrlRowId);

            // Output validation:
            // We need to take into account that a malicious user hacked our database directly after 
            // the data was already inserted and altered it. Therefore, we need to validate the longUrl before sending to the user.
            ValidationResult validationResult = validateLongUrl(longUrl);
            if (!validationResult.isValid) {
                longUrl = null;
            }

            if (longUrl == null || longUrl.length() == 0) {
            	// Url not found, or is found to be invalid.
            	// TODO: rename the web app state below to reflect this. 
            	redirectTo = BuildServerHttpLocation(req) + "index.html#!/miniUrlNotFound";
            } else if (client != null && client.equals("minifyApp")) {
                // client='minifyApp' is a NV pair identifying when the client is the Home page of this web app.
                // In this case, when redirecting to the long url destination, there is no need to repeat the
                // Safe Browsing check (it was already done when generating the minfied URL),
                // and we can redirect directly to the destination web site.
            	redirectTo = longUrl;
            } else {
            	// Notify the client to first check the URL it is not malicious, and only then redirect there. 
                String urlEncoded = URLEncoder.encode(longUrl, "UTF-8");
                redirectTo = BuildServerHttpLocation(req) + "index.html#!/safeRedirect?destination=" + urlEncoded;
            }

            if (isDebugMode) {
                System.out.println("Retreived (minifiedUrl, longUrl) : (" + req.getRequestURL() + ", " + longUrl + ")");
            }

        } catch (Exception exception) {

        	redirectTo = BuildServerHttpLocation(req) + "index.html#!/miniUrlNotFound";
        }

        resp.sendRedirect(redirectTo);
    }

    //
    // Handler for Post requests passing long Urls requesting a minified Url in exchange. 
    // Service promise:
    // Service response data is in JSON format.
    // Response contains both 'errorString' and 'minifiedUrl' string parameters.
    // In a response, one and only one of 'errorString' and 'minifiedUrl' is non-zero length.
    // 
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String errorString = "";
        String minifiedUrl = "";

        try {

            isDebugMode = (req.getServerName().contains("localhost"));
            BufferedReader reader = req.getReader();
            Gson gsonIn = new Gson();
            MinifyUrlData minifyUrlData = gsonIn.fromJson(reader, MinifyUrlData.class);
            String longUrl = minifyUrlData.getLongUrl().trim();

            // Input validation:
            ValidationResult validationResult = validateLongUrl(longUrl);
            if (validationResult.isValid) {
                /*
                 * TODO: consider checking if the longUrl is already in DB. In that case, no need to re-insert.
                 * However, at this time, I believe such a check on each and every insert is not justified
                 * for what I believe is more than likely only non-often re-entry of identical longUrl's.
                 */
                Integer minifiedUrlRowId = miniUrlsStorge.insertUrl(longUrl);

                // http://google.github.io/guava/releases/22.0-android/api/docs/
                String minifiedUrlCode = BaseEncoding.base32().encode(minifiedUrlRowId.toString().getBytes(Charsets.US_ASCII));
                minifiedUrl = BuildServerHttpLocation(req) + minifiedUrlCode;

                // Given the current code structure, this cannot happen, but for maintainability sake :
                if (minifiedUrl.length() == 0) {
                    errorString = "Ouch. URL minification failed due to an unexpected server error. Please try again.";
                }

            } else {

                errorString = "Ouch. URL minification failed: " + validationResult.reason;
            }

            if (isDebugMode) {
                System.out.println("Generated (minifiedUrl, longUrl) : (" + minifiedUrl + ", " + longUrl + ")");
            }

        } catch (Exception exception) {

            minifiedUrl = "";
            errorString = "Ouch. URL minification failed due to an unexpected server error. Please try again.";
        }

        JsonObject outJsonData = new JsonObject();
        outJsonData.addProperty("errorString", errorString);
        outJsonData.addProperty("minifiedUrl", minifiedUrl);

        resp.setContentType("application/json");
        resp.getWriter().write(outJsonData.toString());
        resp.getWriter().flush();
    }

    // Validate that the long url does not contain any JavaScript code and is not too long for processing/storing.
    // validateLongUrl(...) does *not* validate that the input is a valid URL per RFC; it validates only that it 
    // is safe to be processed by this application.
    private ValidationResult validateLongUrl(String longUrl) {

        ValidationResult validationResult = new ValidationResult(true, "URL is a valid URL.");

        // For testing ease, in dev / localhost mode, make maxAllowedCharacters a relatively small number. 
        int maxAllowedCharacters = (isDebugMode == true) ? 100 : 4000;	

        if (longUrl.length() > maxAllowedCharacters) {
            validationResult.isValid = false;
            validationResult.reason = "URL exceeds max allowed characters.";
        } else if (Pattern.matches("(?i)\\S*<\\s*(script|/script|link|/link)\\s*>\\S*", longUrl)) {
            validationResult.isValid = false;
            validationResult.reason = "URL contains disallowed scripting.";
        }

        return validationResult;
    }

    private String BuildServerHttpLocation(HttpServletRequest req) {
        return "http://" + req.getServerName() + ":" + req.getServerPort() + "/";
    }
}