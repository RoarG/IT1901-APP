/*
 * File: base.php
 * Holds: Holds 
 * Last updated: 16.09.13
 * Project: Prosjekt1
 * 
*/

function Base (jq) {
    
    //
    //  Variables
    //
    
    this.ls, this.token = null;
    
    //
    //  Constructor
    //
    
    // Accessing localStoreage
    this.ls = localStorage;
        
    // Setting token-value
    var temp_token = localStorage.getItem('api-token');
    if (temp_token != null && temp_token.length > 10) {
        this.token = temp_token;
    }
    
        
    //
    // Ajax
    //
        
    this.ajax = function () {
        call : function () {
            //
        },
        tpl : function (tpl) {
            //
        }
    }
    };
        
    //
    // Animations
    //
    
    this.animate = {
        fadeIn : function (html) {
            $('#main').fadeOut(400,function () {
                $('#main').html(html).fadeIn(400);
            });
        },
    };
    
    //
    // Templates
    //
    
    this.template = {}; // TODO
    
    //
    // INIT
    //
        
    this.init = function () {
        var self = this;
        if (this.token != null) {
            // No token sat, display login-form
            $.ajax ({
                url: 'api/?tpl=login',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    self.animate.fadeIn(json.tpl.base);
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
                    console.log(this);
                    if (json.code == '200') {
                        self.animate.fadeIn(json.tpl.home); // TODO
                    }
                    else {
                        self.animate.fadeIn(json.tpl.base);
                    }
                }
            });
        }
    };    
}