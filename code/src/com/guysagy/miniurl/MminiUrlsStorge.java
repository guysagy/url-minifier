package com.guysagy.miniurl;

import java.util.ArrayList;
import java.util.List;

public class MminiUrlsStorge {

    private List<String> miniUrlsData = new ArrayList<>();

    synchronized public Integer insertUrl(String longUrl) {

        miniUrlsData.add(longUrl);
        Integer tableRowId = miniUrlsData.size()-1;
        return tableRowId;
    }

    synchronized public String getLongUrl(Integer tableRowId) {

        String longUrl = null;
        try {
            longUrl = miniUrlsData.get(tableRowId);
        } catch (IndexOutOfBoundsException exception) {
        	// Not really needed with this code structure, but for maintainability sake :
        	longUrl = null; 
        }
        return longUrl;
    }
}