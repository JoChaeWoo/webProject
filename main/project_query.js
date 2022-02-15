
$(document).ready(function(){
    var isOdd = 0;
    $("#extend_button").click(function(){
        if(isOdd % 2 == 0){
            $('#describe > div').css('padding','0px'),
            $('#extend_button').animate({
                right: '0%'
            }),$('.lang_button').animate({
                right: '0%'
            }),$('#describe').animate({
                width: '0%'
            }),$('#map').animate({
                width: '75%'
            }, function(){
                mapObject.setSize({width: $('#map').css('width'), height: $('#map').css('height')});
            });
        }
        else{
            $('#describe > div').css('padding','0px 3px'),
            $('#extend_button').animate({
                right: '25%'
            }),$('.lang_button').animate({
                right: '25%'
            }),$('#describe').animate({
                width: '25%'
            }),$('#map').animate({
                width: '50%'
            }, function(){
                mapObject.setSize({width: $('#map').css('width'), height: $('#map').css('height')});
            });
        }
        isOdd = (isOdd + 1) % 2;
    });
    
});