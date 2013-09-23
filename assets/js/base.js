/*
 * File: base.php
 * Holds: Holds 
 * Last updated: 16.09.13
 * Project: Prosjekt1
 * 
*/

function Base () {
    
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
    
    // Setting template-settins for underscore.js
    /*_.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };*/
        
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
        slideLeft : function (html, depth) {
            // Get the current depth
            var current_depth = $('#main > div').length;
            
            // Decide if we should append or update html-content
            if (current_depth == depth) {
                $('#main-'+depth).html(html);
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400);
            }
            else {
                $('#main').append(html).css('width',((current_depth+1)*640));
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400);
            }
            
            // Display back-button if it's hidden
            var $back = $('#back');
            if ($back.is(':hidden')) {
                $back.show();
            }
        },
        slideRight : function (html, depth, destroy) {
            //
        }
    };
    
    //
    // Back-button
    //
    
    this.handleBack = function () {
        // Get the current depth
        var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640);
        
        // Send back
        $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400);
    }
    
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
            url: 'api/sheep?method=get&tpl=sheep_all&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Generate the template
                    var template = _.template(json.tpl.sheep_all.base);
                    var output = template({
                        inner: _.template(json.tpl.sheep_all.row,{items:json.response.sheep})
                    });
                    
                    // Run the animation
                    self.animate.slideLeft(output, 2);
                }
                else {
                    // Something went wrong!
                }
            }
        });
    }
}