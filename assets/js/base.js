/*
 * File: base.php
 * Holds: Holds 
 * Last updated: 12.09.13
 * Project: Prosjekt1
 * 
*/

var Base = {
    
    //
    //  Variables
    //
    
    jQuery : null,
    ls : null,
    token : null,
    
    //
    //  Constructor
    //
    
    _ : function (jq) {
        // Setting jQuery
        this.jQuery = jq;
        
        // Accessing localStoreage
        this.ls = localStorage;
        
        // Setting token-value
        var temp_token = localStorage.getItem('api-token');
        if (temp_token != null && temp_token.length > 10) {
            this.token = temp_token;
        }
    },
    
    //
    // Ajax
    //
    
    ajax: (function () {
        return {
            call : function () {
                //
            },
            tpl : function (tpl) {
                //
            }
        }
    })(),
    
    //
    // Animations
    //
    
    animate : (function () {
        return {
            fadeIn : function (html) {
                $('#main').fadeOut(400,function () {
                    $('#main').html(html).fadeIn(400);
                });
            }
        }
    })(),
    
    //
    // INIT
    //
    
    init : function () {
        if (this.token != null) {
            // No token sat, display login-form
            $.ajax ({
                url: 'api/?tpl=login',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    Base.animate.fadeIn(json.tpl.base);
                }
            });
        }
        else {
            // We have a token, validate it
            $.ajax ({
                url: 'api/auth/validate?method=get&access_token='+this.token+'&tpl=login',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    
                    if (json.code == '200') {
                        console.log('lol?');
                    }
                    else {
                        Base.animate.fadeIn(json.tpl.base);
                    }
                }
            });
        }
    },
    
    //
    //  LOGIN
    //
    
    login : {
        
        //
        // Placeholder and stuff
        //
        
        test: function () {
            console.log('test');
        }
    }
}