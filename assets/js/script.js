$(document).ready(function () {
    // Load the base-object
    var base = new Base();
    
    // Login
    $('#main').on('submit','#login_form',function () {
        base.login($(this).serialize());
        
        // Return false to avoid the actual form from getting submitted
        return false;
    });
    
    // Initiate the entire thingy!
    base.init();
});