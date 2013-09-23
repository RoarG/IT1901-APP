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
    var temp_token = this.ls.getItem('api-token');
    if (temp_token != null && temp_token.length > 10) {
        this.token = temp_token;
    }
    
        
    //
    // Ajax
    //
        
    /*this.ajax = function () {
        call : function () {
            //
        },
        tpl : function (tpl) {
            //
        }
    }
    };*/
    
    //
    // Token
    //
    
    this.setToken = function (t) {
        this.token = t;
        this.ls.setItem('api-token',t);
    }
      
    //
    // Animations
    //
    
    this.animate = {
        fadeIn : function (target, html) {
            $(target).fadeOut(400,function () {
                $(target).html(html).fadeIn(400);
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
        if (this.token == null) {
            // No token sat, display login-form
            $.ajax ({
                url: 'api/?tpl=login',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    self.animate.fadeIn('#main', json.tpl.login.base);
                }
            });
        }
        else {
            // We have a token, validate it
            $.ajax ({
                url: 'api/auth/validate?method=get&access_token='+this.token+'&tpl=login,home',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    if (json.code == '200') {
                        // Update content
                        self.animate.fadeIn('#main', json.tpl.home.base); // TODO
                        
                        // Change title
                        document.title = 'Sheep :: '+json.response.system_name;
                        
                        // Set notification-number & show
                        $('#notifications a').html(json.response.notifications);
                        $('#notifications').show();
                    }
                    else {
                        self.animate.fadeIn('#main', json.tpl.login.base);
                    }
                }
            });
        }
    }; 
    
    this.login = function (ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/auth?method=put&tpl=home',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                if (json.code == 200) {
                    // Setting token
                    self.setToken(json.response.access_token);
                    
                    // Animating
                    self.animate.fadeIn(json.tpl.home.base);
                    
                    // Change title
                    document.title = 'Sheep :: '+json.response.system_name;
                    
                    // Set notification-number & show
                    $('#notifications a').html(json.response.notifications);
                    $('#notifications').show();
                }
                else {
                    var $wrong_box = $('#login_wrong_pw');
                    if ($wrong_box.is(':hidden')) {
                        $wrong_box.slideDown(400);
                    }
                }
            }
        });
    };
    
    //
    // Lalal
    //  
    
    this.sau_alle = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep?method=get&tpl=sheep-all&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                console.log(json);
                if (json.code == 200) {
                    // Build string
                }
                else {
                    // Something went wrong!
                }
            }
        });
    }
}