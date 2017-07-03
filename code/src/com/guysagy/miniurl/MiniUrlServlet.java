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

/*
 * Documentation for Class BaseEncoding used : http://google.github.io/guava/releases/22.0-android/api/docs/
 */

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

    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException  {

        String destination = null;

        try {

            isDebugMode = (req.getServerName().contains("localhost"));
            String client = req.getParameter("client");

            String minifiedUrlCode = req.getRequestURI().substring(1).trim(); // Remove the leading "/" of the URI.
            byte[] decodedMinifiedUrlCode = BaseEncoding.base32().decode(minifiedUrlCode);
            String minifiedUrlRowIdAsString = "";
            for(byte urlByte: decodedMinifiedUrlCode){
                minifiedUrlRowIdAsString += Character.toString((char)urlByte);
            }
            Integer minifiedUrlRowId = Integer.parseInt(minifiedUrlRowIdAsString);
            String longUrl = miniUrlsStorge.getLongUrl(minifiedUrlRowId);
            // Output validation:
            // We need to take into account that a malicious user hacked our database directly.
            // Therefore, we need to validate the longUrl before sending to the user.
            ValidationResult validationResult = validateLongUrl(longUrl);
            if (!validationResult.isValid) {
                longUrl = null;
            }

            if (longUrl == null || longUrl.length() == 0) {
                destination = BuildServerHttpLocation(req) + "index.html#!/miniUrlNotFound";
            } else if (client != null && client.equals("minifyApp")) {
                // client='minifyApp' is a NV pair identifying when the client is the Home page of this web app.
                // In this case, when redirecting to the long url destination, there is no need to repeat the
                // Safe Browsing check (it was already done when generating the minfied URL),
                // and we can redirect directly to the destination web site.
                destination = longUrl;
            } else {
                String urlEncoded = URLEncoder.encode(longUrl, "UTF-8");
                destination = BuildServerHttpLocation(req) + "index.html#!/safeRedirect?destination=" + urlEncoded;
            }

            if (isDebugMode) {
                System.out.println("Retreived (minifiedUrl, longUrl) : (" + req.getRequestURL() + ", " + longUrl + ")");
            }

        } catch (Exception exception) {

            destination = BuildServerHttpLocation(req) + "index.html#!/miniUrlNotFound";
        }

        resp.sendRedirect(destination);
    }

    // Service promise:
    // Service response data is in JSON format.
    // Response contains both 'errorString' and 'minifiedUrl' string parameters.
    // In a response, one and only one of 'errorString' and 'minifiedUrl' is non-zero length.
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
                 * TODO: consider checking if the longUrl is already in DB. in that case, no need to re-insert.
                 * However, at this time, I believe such a check on each and every insert is not justified
                 * for, what I believe is more than likely only non-often, re-entry of identical longUrl's.
                 */
                Integer minifiedUrlRowId = miniUrlsStorge.insertUrl(longUrl);
                String minifiedUrlCode = BaseEncoding.base32().encode(minifiedUrlRowId.toString().getBytes(Charsets.US_ASCII));
                minifiedUrl = BuildServerHttpLocation(req) + minifiedUrlCode;
                // Given the current code structure, this cannot happen,
                // but for maintainability sake :
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
    // validateLongUrl(...) does *not* validate that the input is a valid URL; it validates only that it does not contain  scripts
    // and that it is not too long for processing/storage.
    private ValidationResult validateLongUrl(String longUrl) {

        ValidationResult validationResult = new ValidationResult(true, "URL is a valid URL.");
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