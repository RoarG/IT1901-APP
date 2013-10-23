<?php
/*
 * File: base.php
 * Holds: Simply outputs the base-url for the current environment
 * Last updated: 23.10.13
 * Project: Prosjekt1
 * 
*/

//
// The REST-class doing most of the magic
//

class Base {
    
    //
    // The method that returns the current baseurl
    //
    
    public function getBaseUrl() {
        return 'http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
    }
}

// Initiale class
$base = new Base();
?>