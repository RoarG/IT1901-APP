/*
 * File: base.php
 * Holds: Holds the base-object that takes care of all the animations and communication with the api
 * Last updated: 29.09.13
 * Project: Prosjekt1
 * 
*/

//
// Prototypes / Methods
//

Number.prototype.formatNumber = function(decPlaces, thouSeparator, decSeparator) { // http://stackoverflow.com/a/9318724/921563
    var n = this,
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSeparator = decSeparator == undefined ? "." : decSeparator,
    thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
    sign = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

//
// Base-class
//

function Base () {
    
    //
    //  Variables
    //
    
    this.ls = null,
    this.token = null,
    this.notifications = 0,
    this.disable_scrolling = false,
    this.map = null,
    this.notification_interval = null,
    this.contact = null,
    this.months = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des'],
    this.displayingMap = false;
    
    //
    //  Constructor
    //
    
    // Accessing localStoreage
    this.ls = localStorage;
        
    // Setting token-value
    var temp_token = this.ls.getItem('api-token');
    if (temp_token != null && temp_token.length > 10) {
        this.token = temp_token;
    };
        
    //
    // Token
    //
    
    this.setToken = function (t) {
        this.token = t;
        this.ls.setItem('api-token',t);
    };
    
    //
    // Back to login
    //
    
    this.kick_out = function () {
        // If something goes wrong, the user ends up here
    }
    
    //
    // Notifications
    //
    
    this.notification_interval_handler = function (state) {
        var self = this;
        if (state) {
            // Turn fetching on
            this.notification_interval = setInterval(function () {
                $.ajax ({
                    url: 'api/notification/num?method=get&access_token='+self.token,
                    cache: false,
                    headers: { 'cache-control': 'no-cache' },
                    dataType: 'json',
                    success: function(json) {
                        if (json.code == '200') {
                            var new_notification_value = json.response.notifications;
                            if (new_notification_value != self.notifications) {
                                // Store new value
                                self.notifications = new_notification_value;
                                
                                // Update displayed value
                                $('#notifications a').html(new_notification_value);
                                
                                // Highlight?
                            }
                        }
                        else {
                            // Error here
                        }
                    }
                });
            },20000);
        }
        else {
            // Turn fetching off
            clearInterval(this.notification_interval);
        }
    };
    
    //
    // Animations
    //
    
    this.animate = {
        fadeIn : function (target, html, depth) {
            // If writing to #main, we have to wrap it
            if (target == '#main') {
                html = '<div id="main-'+depth+'">'+html+'</div>';
            }
            
            $(target).fadeOut(400,function () {
                $(target).html(html).fadeIn(400);
            });
        },
        slideLeft : function (html, depth, callback) {
            // Check if the depth already exists
            var $obj = $('#main-'+depth);
            var current_depth = $('#main > div').length;
            
            if ($obj.length > 0) {
                // Object does exits
                $('#main-'+depth).html(html);
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            }
            else {
                $('#main').append('<div id="main-'+depth+'">'+html+'</div>').css('width',((current_depth+1)*640));
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            }
            
            // Set height for the container
            $('#main').animate({Height: $('#main-'+depth).height()},400);
            
            // Display back-button if it's hidden
            var $back = $('#back');
            if ($back.is(':hidden')) {
                $back.show();
            }
        },
        resizeMain : function () {
            // Get current depth
            var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640) + 1;
            
            // Set height for the container
            $('#main').animate({Height: $('#main-'+depth).height()},400);
        },
        mapSpecial : function (mode) {
            $('#nav').animate({marginTop : ((mode)?'-161px':'0px')},400);
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
        
        // Set height for the container
        $('#main').css('height',$('#main-'+depth).height());
        
        // Enable scrolling (if turned off)
        disable_scrolling = false;
        
        // Hide the back-button
        if (depth == 1) {
            $('#back').hide();
        }
        
        // Check if currently displaying map
        if (this.displayingMap) {
            this.displayingMap = false;
            this.animate.mapSpecial(false);
        }
    };
    
    //
    // Init
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
                        self.animate.fadeIn('#main', json.tpl.home.base, 1);
                        
                        // Change title
                        document.title = 'Sheep Locator :: '+json.response.system_name;
                        
                        // Set notification-number & show
                        $('#notifications a').html(json.response.notifications);
                        $('#notifications').show();
                        self.notifications = json.response.notifications;
                        
                        // Start fetching notifications every 20 seconds
                        self.notification_interval_handler(true);
                    }
                    else {
                        self.animate.fadeIn('#main', json.tpl.login.base, 1);
                    }
                }
            });
        }
    };
    
    //
    // Login
    //
    
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
                    self.animate.fadeIn('#main',json.tpl.home.base, 1);
                    
                    // Change title
                    document.title = 'Sheep Locator :: '+json.response.system_name;
                    
                    // Set notification-number & show
                    $('#notifications a').html(json.response.notifications);
                    $('#notifications').show();
                    self.notifications = json.response.notifications;
                    
                    // Start fetching notifications every 20 seconds
                    self.notification_interval_handler(true);
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
    // Log out
    //
    
    this.logout = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/auth?method=get&tpl=login&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                // Setting token
                self.setToken(null);
                
                // Animating
                self.animate.fadeIn('#main',json.tpl.login.base, 1);
                    
                // Change title
                document.title = 'Sheep Locator';
                
                // Hide notification-number & show
                $('#notifications').hide();
                
                // Stop fetching notifications every 20 seconds
                self.notification_interval_handler(false);
                
                // Hide back-button
                $('#back').hide();
            }
        });
    };
    
    //
    // Sheep - Display all
    //  
    
    this.sheep_all = function () {
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
    };
    this.sheep_one = function (id) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=get&tpl=sheep_single&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    var response = json.response;
                    
                    // Manipulate the data before parsing
                    if (response.vaccine == 1) {
                        response.vaccine = 'Ja';
                    }
                    else {
                        response.vaccine = 'Nei';
                    }
                    
                    response.weight = parseInt(response.weight,10).formatNumber(0,',','');
                    
                    var birthday = response.birthday.split('-');
                    response.birthday = parseInt(birthday[2])+'. '+self.months[parseInt(birthday[1])-1]+' '+birthday[0];
                    
                    var last_updated = response.last_updated.split(' ');
                    var last_updated_date = last_updated[0].split('-');
                    response.last_updated = parseInt(last_updated_date[2])+'. '+self.months[parseInt(last_updated_date[1])-1]+' '+last_updated_date[0]+', kl: '+last_updated[1];
                    
                    var comment = response.comment;
                    if (comment.length == 0) {
                        response.comment = '<p><i>Ingen kommentar</i></p>';
                    }
                    else {
                        var comment_split = comment.split("\n");
                        if (comment_split.length > 1) {
                            var temp_comment = '';
                            for (var i = 0; i < comment_split.length; i++) {
                                temp_comment += '<p>'+comment_split[i]+'</p>';
                            }
                            response.comment = temp_comment;
                        }
                        else {
                            response.comment = '<p>'+comment+'</p>';
                        }
                    }
                    
                    // Generate the template
                    var output = _.template(json.tpl.sheep_single.base,response);
                    
                    // Run the animation
                    self.animate.slideLeft(output, 3);
                }
                else {
                    // Something went wrong!
                }
            }
        });
    };
    this.sheep_one_delete = function (id) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=delete&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Go back to the previous page
                    self.sheep_all();
                }
                else {
                    // Something went wrong!
                }
            }
        });
    }
    this.sheep_one_edit = function (id) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=get&tpl=sheep_single_edit&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Fix vaccine_pretty for parsing
                    json.response.vaccine_pretty = ((json.response.vaccine == '1')?'Ja':'Nei');
                    
                    // Parse the template
                    var template = _.template(json.tpl.sheep_single_edit.base, json.response);
                    
                    // Run the animation
                    self.animate.slideLeft(template, 4);
                }
                else {
                    // Something went wrong!
                }
            }
        });
    }
    this.sheep_edit_submit = function (id, ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                var code = json.code;
                if (code == 200) {
                    // Display the new sheep
                    self.sheep_one(json.response.id);
                }
                else {
                    // Return error-message!
                    alert('Noe gikk galt. Systemet returnerte feilkode #'+code+' og teksten '+json.msg);
                }
            }
        });
    }
    
    //
    // Sheep - Display on map
    //
    
    this.sheep_map = function () {
        var self = this;
        
        // Storing current state
        self.displayingMap = true;
        
        $.ajax ({
            url: 'api/map?method=get&tpl=sheep_map&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {               
                    // Run the animations
                    self.animate.mapSpecial(true);
                    self.animate.slideLeft(json.tpl.sheep_map.base, 2, function () {
                        // Set the height of the map
                        $('#map').css('height',$(window).height() - 101);
                        
                        // Resize
                        self.animate.resizeMain();
                        
                        var pos = json.response.center;
                        
                        // Init Google Maps
                        self.map = new google.maps.Map(document.getElementById("map"),{
                            center: new google.maps.LatLng(pos.lat, pos.lng), 
                            zoom: 9,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            streetViewControl: false});
                        
                        // Get all the sheeps and display them
                        for (var i = 0; i < json.response.sheep.length; i++) {
                            var current_sheep = json.response.sheep[i];
                            var map_marker = new google.maps.Marker({
                                map: self.map,
                                position: new google.maps.LatLng(current_sheep.lat, current_sheep.lng),
                                //icon: 'assets/css/gfx/kartikoner/overnatting.png',
                                visible: true
                            });
                            
                            // TODO, marker + infobox
                        }
                    });
                }
                else {
                    // Something went wrong!
                }
            }
        });
    };
    
    //
    // Sheep - Add
    //
    
    this.sheep_add = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/?tpl=sheep_add',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                // Run the animation
                self.animate.slideLeft(json.tpl.sheep_add.base, 2);
            }
        });
    }
    this.sheep_add_submit = function (ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/?method=post&access_token='+self.token+'&tpl=sheep_add',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                var code = json.code;
                if (code == 200) {
                    // Reset the form
                    $('#sheep_add_form input').val('');
                    
                    // Display the new sheep
                    self.sheep_one(json.response.id);
                }
                else {
                    // Return error-message!
                    alert('Noe gikk galt. Systemet returnerte feilkode #'+code+' og teksten '+json.msg);
                }
            }
        });
    }
    
    //
    // Admin - Edit
    //
    
    
    
    //
    // Admin - Alert
    //
    
    this.admin_alert = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/contact?method=get&tpl=admin_alert&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {               
                    // Generate the template
                    var template = _.template(json.tpl.admin_alert.base);
                    var output = template({
                        inner: _.template(json.tpl.admin_alert.row,{items:json.response.contact})
                    });
                    
                    // Storing conact for laters
                    self.contact = json.response.contact;
                    
                    // Run the animation
                    self.animate.slideLeft(output, 2);
                }
            }
        });
    };
    this.admin_alert_remove = function(elm) {
        var self = this;
        
        // Building new contact-array without the one element we wish to delete
        var new_arr = [];
        var local_contact = self.contact;
        
        for (var i = 0; i < local_contact.length; i++) {
            var local_local_contact = local_contact[i];
            
            // Check if we can append this contact-person or not
            if (local_local_contact.epost != elm) {
                // Append
                new_arr.push(local_local_contact);
            }
        }
        
        // Doing the request
        $.ajax ({
            url: 'api/contact?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: { 'contact' : new_arr },
            success: function(json) {
                // Resize the window
                self.animate.resizeMain();
            }
        });
    };
    this.admin_alert_add = function (elm) {
        var self = this;
        
        // Building new contact-array without the one element we wish to delete
        self.contact.push(elm);
        
        $.ajax ({
            url: 'api/contact?method=put&tpl=admin_alert&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: { 'contact' : self.contact },
            success: function(json) {
                // Generate the new box
                var output = _.template(json.tpl.admin_alert.row,{items:[elm]});
                $('#admin-alert-container').append(output);
                
                // Resize the window
                self.animate.resizeMain();
                
                // Reset form
                $('#name,#epost').val('');
            }
        });
    };
    
    //
    // Admin - Log
    //
}