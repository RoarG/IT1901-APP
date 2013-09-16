/*
 * File: base.php
 * Holds: Holds 
 * Last updated: 12.09.13
 * Project: Prosjekt1
 * 
*/

var Base = function () {
    
    //
    //  Variables
    //
    
    var ls, token, derp;
    
    //
    //  Constructor
    //
       
    // Accessing localStoreage
    this.ls = localStorage;
    
    this.derp = 'roflrofl';
    
    console.log(this);
        
    // Setting token-value
    var temp_token = localStorage.getItem('api-token');
    if (temp_token != null && temp_token.length > 10) {
        this.token = temp_token;
    }
    
    return (function (that) {
        var me = that;
        //var ls = _ls;
        console.log(me);
        
        //
        // Ajax
        //
        
        /*var ajax = function () {
            return {
                call : function () {
                    //
                },
                tpl : function (tpl) {
                    //
                }
            }
        })();*/
        
        //
        // Animations
        //
        
        var animate = {
            fadeIn : function (html) {
                $('#main').fadeOut(400,function () {
                    $('#main').html(html).fadeIn(400);
                });
            }
        };
    
        //
        // INIT
        //
        
        var init = function () {
            console.log(this);
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
                        
                        if (json.code == '200') {
                            console.log('lol?');
                        }
                        else {
                            self.animate.fadeIn(json.tpl.base);
                        }
                    }
                });
            }
        };
    
        //
        //  LOGIN
        //
        
        /*login : {
            
            //
            // Placeholder and stuff
            //
            
            test: function () {
                console.log('test');
            }
        }*/
    })(this);
}