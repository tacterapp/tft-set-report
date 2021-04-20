
var timeout_report = 30 * 1000; // 30 seg
var share_message = 'Check my TFT Set 4 performance';
var app_url = 'https://get.tacter.app/KWRiClhutfb';
var api_url = 'https://staging.tacter.app/tft/v1';
var web_url = 'https://report.tacter.app/';

var step = 1;
var screen_width = $(document).width();
var is_mobile = screen_width < 480;
var loading = false;
var username;
var region;
var timeout_check;

function format_time(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}


function goStep(index){
    
    $('#error').hide();
    $('.step').hide();
    $('#step'+index).fadeIn();
    

    $('#step' + index + ' .number').each(function(){
        $(this).html('0').animateNumbers( $(this).data('number') , true);
    });
    

    $('#step' + index + ' .graph').each(function(){
        $(this).css('height', 0).animate({
            height: $(this).data('number')
        }, 1500);
    });

        
    $('#step' + index + ' .icon').css('opacity', 0).each(function(i, obj){

        $(this).delay(i*250).animate({
            opacity: 1
        }, 500);
        
    });


    if( index == 1 ){
        $('#credits').hide();
        clearInterval( timeout_check );
    }else{
        $('#credits').show();
    }



    if( !is_mobile ){
        if( index == 6 ){
            $('#credits').removeClass('credits_fixed');
        }else{
            $('#credits').addClass('credits_fixed');
        }
    }
    
}




    

function printInformation(data){
    $('.username').html(data.summonerName);
    $('.region').html(data.region);
    $('.rank').html(data.rank);

    var t_longest_time = format_time( parseInt(data.longestGameTime) ).split(':');
    var t_shortest_time = format_time( parseInt(data.shortestGameTime) ).split(':');
    var t_avg_time = format_time( parseInt(data.avgMatchTime) ).split(':');



    $('.time_longest_hour').data('number', t_longest_time[0]);
    $('.time_longest_minute').data('number', t_longest_time[1]);

    $('.time_shortest_hour').data('number', t_shortest_time[0]);
    $('.time_shortest_minute').data('number', t_shortest_time[1]);

    $('.time_avg_hour').data('number', t_avg_time[0]);
    $('.time_avg_minute').data('number', t_avg_time[1]);





    $('.rank_icon').css('background-image', "url('" + data.rankIconURL + "')");   
    $('.total_games').data('number', parseInt(data.gamesPlayedCount));
    $('.total_hours').data('number', parseInt(data.hoursCount));
    $('.total_killed').data('number', parseInt(data.playersKilled));
    $('.total_damage').data('number', parseInt(data.playersDamage));



    var html_champions = '';
    $(data.champions).each(function(){
        html_champions += '<div class="col3">' + this.name + '<img src="' + this.iconURL + '" class="icon"><b><span class="number" data-number="' + this.games + '">0</span> games</b>' + this.rank + '% top 4</div>';
    });
    $('#champions').html(html_champions);


    var html_items = '';
    $(data.items).each(function(){
        html_items += '<div class="col3">' + this.name + '<img src="' + this.iconURL + '" class="icon"><b><span class="number" data-number="' + this.games + '">0</span> games</b>' + this.rank + '% top 4</div>';
    });
    $('#items').html(html_items);


    $('#step6 .box_avatar img').remove();
    var html_items_aux = '&nbsp; <img src="' + data.champions[0].iconURL + '" title="' + data.champions[0].name + '" style="cursor:help;" align="absmiddle" width="30" height="30" class="icon"> ';
    html_items_aux += '<img src="' + data.items[0].iconURL + '" title="' + data.items[0].name + '" style="cursor:help;" align="absmiddle" width="30" height="30" class="icon"> ';
    $('#step6 .box_avatar div').append(html_items_aux);



    var placement_max = 0;
    var html_placements = '<tr>';

    $(data.placements).each(function(i, value){
        if( placement_max < value ) placement_max = value;
    });

    $(data.placements).each(function(i, value){
        var current_value = parseInt( ( value * 150 ) / placement_max);
        var current_color;

        if( i == 0 ){
            current_color = '#baa944';
        }else if( i == 1 ){
            current_color = '#7d8891';
        }else if( i == 2 ){
            current_color = '#bd7753';
        }else{
            current_color = '#565d64';
        }

        html_placements += '<td valign="bottom" height="200">' + value + ' <div class="graph" data-number="' + current_value + '" style="background:' + current_color + ';width:10px;margin:10px auto;display:block;height:0;font-size:0;">&nbsp;</div></td>';
    });

    html_placements += '</tr>';
    html_placements += '<tr class="bold">';
    html_placements += '<td>1st</td>';
    html_placements += '<td>2nd</td>';
    html_placements += '<td>3rd</td>';
    html_placements += '<td>4th</td>';
    html_placements += '<td>5th</td>';
    html_placements += '<td>6th</td>';
    html_placements += '<td>7th</td>';
    html_placements += '<td>8th</td>';
    html_placements += '</tr>';

    $('.placements').html(html_placements);

    goStep(3);
}


function checkSummoner(username, region){
    $.ajax({
        url: api_url + '/report?summonerName=' + username + '&region=' + region,
        dataType: 'json',
        complete: function(e, xhr, settings){
            var data = $.parseJSON(e.responseText);
            if(e.status === 200){
                printInformation(data);
            }else if(e.status === 202){
                timeout_check = setTimeout(function(){
                    checkSummoner(username, region);
                }, timeout_report);
            }else if(e.status === 400){
                showError(data);
            }else if(e.status === 500){
                showError(data);
            }
        }
    });
}

function showError(data){
    $('#step1').hide();
    $('#step2').hide();
    $('#error').show();
    $('#reason').html(data.reason);

    $('#error .username').html(username);
    $('#error .region').html(region);
}

function resetFormUser(){
    $('#summoner').val('');
    goStep(1);
}

$(function(){

    $('#form_username').submit(function(e){
        e.preventDefault();
        
        goStep(2);

        username = $('#summoner').val().trim();
        region = $('#region').val();

        checkSummoner(username, region);
    });


    $('#form_email').submit(function(e){
        e.preventDefault();

        $('#msg_sent').show();
        $('#btn_send_email').css('disabled', 'disabled').css('opacity', 0.5).html('Email submitted!');
    
        $.ajax({
            url: api_url + '/report?summonerName=' + username + '&region=' + region + '&email=' + $('#email').val(),
            dataType: 'json',
            complete: function(e, xhr, settings){
                var data = $.parseJSON(e.responseText);
                if(e.status === 200){
                    printInformation(data);
                }else if(e.status === 400){
                    showError(data);
                }else if(e.status === 500){
                    showError(data);
                }
            }
        });
    });



    if( document.location.href.indexOf('summonerName') > -1 ){
        let searchParams = new URLSearchParams(window.location.search);
        username = searchParams.get('summonerName');
        region = searchParams.get('region');

        checkSummoner(username, region);
    }else{
        goStep(1);
    }


            

    $('.download').click(function(){
        window.open(app_url);
    });


    $('.btn_share').click(function(){
        var network = $(this).attr('alt');
        var share_url = web_url + '?summonerName=' + username + '&region=' + region;
        
        if (network == 'twitter') {
            share_url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(share_message) + '&tw_p=tweetbutton&url=' + encodeURIComponent( share_url );

        } else if (network == 'facebook') {
            share_url = 'https://www.facebook.com/sharer/sharer.php?u=' + share_url + '&quote=' + encodeURIComponent(share_message);

        } if (network == 'whatsapp') {
            share_url = 'whatsapp://send?text=' + encodeURIComponent(share_message + ' ' + share_url);
        }

        window.open(share_url);
    });


});