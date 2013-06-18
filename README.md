# Playlist
## A storytelling template provided by Esri

- [Sample App](http://downloads.esri.com/agol/pub/npstop102012/index.html);
- [Sample Data](http://www.arcgis.com/sharing/content/items/d0c16110531a43cda47a9d26f6981211/data);
- [Build your first playlist app](http://blogs.esri.com/esri/arcgis/2013/06/17/using-storytelling-playlist-template/);


This template provides a starting point for creating your web application. This easily configurable template allows you to define the webmap, title and subtitle for the site. This read-me file explains how to setup and configure the template to run on your web server. We've also provided a few tips on how to personalize the template by adding a company logo.


### Table of Contents

- [Install the web applciation](#install-the-web-application)
- [Configure the application](#configure-the-application)
- [Personalize the application](#personalize-the-application)


### Install the web application

These instructions assume that you have a Web server like [Internet Information Services(IIS)](http://www.iis.net/) installed and setup on your machine. If you are using another Web server the general installation steps will be the same but you will need to check your Web server's documentation for specific information on deploying and testing the application.

1. Copy the contents of the zip file into your web server's root directory. In IIS, the default location for the web server's root folder is `c:\inetpub\wwwroot`
2. (Optional). If your application edits features in a feature service or generates requests that exceed 2000 characters you may need to setup and use a proxy page. Common situations where you may exceed the URL length are, using complext polygons as input to a task or specifying a spatial reference using well-known text (wkt). View the [Using the proxy page](http://help.arcgis.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/ags_proxy.htm) help topic for details on installing and configuring a proxy page.
3. Test the page using the following URL: http://localhost/[template name]/index.html, where [template name] is the name of the folder where you extracted the zip contents.

[Top](#playlist)


### Configure the application

Now let's configure the application to use a different ArcGIS Online group, title or subtitle.

1. Every saved map on ArcGIS Online has a unique identifier. To find the map ID, navigate to [ArcGIS Online](http://www.arcgis.com), and find the map you want to display. If it is one of your maps, make sure it's shared with everyone (public). View the map details and copy the ID from the URL in the top of your browser. This will be the last set of randomly genterated letters and numbers at the end of the URL.
2. Open the index.html file in a text editor. You can edit this file to set the following application properties:
    - **webmap**: unique identifier for the ArcGIS.com map.
    - **title**: The main title that will be displayed in the application.
    - **subtitle**: The subtitle that will be displayed underneath the title in the main application.
    - **description**: Enter a description you wish to display. Leave as empty quotations if using multiple webmaps.
    - **bingmapskey**: If the webmap uses Bing Maps data, you will need to provided your Bing Maps Key.
    - **proxyurl**: Enter proxy if needed. View the [Using the proxy page](http://help.arcgis.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/ags_proxy.htm).
    - **geometryserviceurl**: Specify the url to a geometry service.
    - **sharingurl**: Modify this to point to your sharing service URL if you are using the portal.
3. To modify these options, change the following code:

    Change only the code within asterisk  (*).

        function init(){
            configOptions = {
                //Enter main title for application
                title : " *This is a custom title for your application* ",
                //Enter the subtitle for the application
                subtitle : " *This is a custom subtitlefor your application* ",
                //Enter a description, if not specified the ArcGIS.com web map's summary is used
                description : "",
                //Enter the Portal URL
                //If the webmap uses Bing Maps data, you will need to provided your Bing Maps Key
    		    bingmapskey : "",
                //specify a proxy url if needed
                proxyurl:"",
                //specify the url to a geometry service
                geometryserviceurl:"http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
                //Modify this to point to your sharing service URL if you are using the portal
                sharingurl :"http://arcgis.com/sharing/content/items"
                }
            }
        }

4. Save the file then test your [application](http://localhost/Chrome/index.html) and note that it now displays your application and if specified your custom title and subtitle.

[Top](#playlist)

### Personalize the application


###### Add a logo to the application

You can personalize your site by adding a custom logo to the application's header next to the map title.

1. First copy your custom logo to the images subdirectory.
2. Open layout.css in a text editor.
3. Find the section of code that has an id of "logoArea" and add the following attribute.

        background:url(../images/yourImage.png) top left no-repeat;

4. Run the application and the custom logo should appear to the left of the title in the application header.


[Top](#playlist)