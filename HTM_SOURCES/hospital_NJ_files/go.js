function set_page_scroll()
{
    $('#header').css('margin', '0 auto');
    $('#header').css('width', '979px');
    $('#header').css('height', '108px');
   /* $('#header').css('z-index', '10');*/
    $('#header').css('top', '0px');
    $('#navigation_bar').css('height', '88px');

    $('#header').css('position', 'fixed');
    $('#main_content').css('margin-right', '-24px');
    $('#main_content').css('position', 'relative');
    $('#main').css('padding-top', '108px');
    $('#main').css('z-index', 'auto');
    var isIpad = navigator.userAgent.match(/iPad/i);
    var isIphone = navigator.userAgent.match(/iPhone/i);
    var isAndroid = navigator.userAgent.match(/Android/i);
    var isWindows = navigator.userAgent.match(/Windows Phone OS/i);
    if(isIpad || isIphone || isAndroid) {
        $('#topnav li').css('font-size', '5px');
        $('#logo').css('height', '108px');
    }
    /*
      if(!isAndroid && !isWindows) {
          $('#main').css('overflow', 'auto');
          $('#main').css('height', $(window).height() - $('#header').height());
      }

      if(isIpad || isIphone || isAndroid || isWindows) {
          $('#main').jScrollTouch();
      }*/
}

var qs_as;

function autocomplete_init() {
    if($('#quicksearch').length >= 1) {
        $('#quicksearch').autosuggest({
            'ajax_page': "ajax/quicksearch.php?",
            'submit_if_one_result': true,
            'before_focus_message': true,
            'submit_if_selected': true,
            'callback_on_click': qs_call,
        });
        autosuggests.push($('#quicksearch').data('autosuggest'));
        autosuggests[autosuggests.length - 1].setAutoSuggest();
    }

    help_init();
}

var autosuggests = new Array();

// function ahd_init_autosuggest(action, inputobj, inputhiddenobj, submit_on_click, before_focus, pulldown, submit_if_selected, submit_if_one_result)
function ahd_init_autosuggest(options)
{
    options.ajax_page = "ajax/quicksearch.php?search=" + options.action + "&";

    if (typeof(options.id) != "undefined" && options.id.length)
    {
        $('#' + options.id).autosuggest(options);
        autosuggests.push($('#' + options.id).data('autosuggest'));
        autosuggests[autosuggests.length - 1].setAutoSuggest();
    }
}



$(document).ready(function() {
    $('#activelist_pulldown').click(function() {
        $('#activelistcontent').toggle();
    });
    $('#activelistcontent').mouseleave(function() {
        setTimeout("hide_active_list()", 500);
    });

    $('#activelistcontent > ul > li').mouseover(function(obj) {
        $(this).attr('class', 'as_highlight');
    });
    $('#activelistcontent > ul > li').mouseleave(function(obj) {
        $(this).attr('class', '');
    });
    $('#activelist').click(function() {
        $('#activelistcontent').toggle();
    });

    $('#applistcontent').mouseleave(function() {
        setTimeout("hide_app_list()", 500);
    });

    $('#apps').click(function() {
        $('#applistcontent').toggle();
    });

    $('#apps_pulldown').click(function() {
        $('#applistcontent').toggle();
    });

    $('#applistcontent > ul > li').mouseover(function(obj) {
        $(this).attr('class', 'as_highlight');
    });
    $('#applistcontent > ul > li').mouseleave(function(obj) {
        $(this).attr('class', '');
    });

});
function hide_active_list() {
    $('#activelistcontent').css('display', 'none');
}
function hide_app_list() {
    $('#applistcontent').css('display', 'none');
}
function help_init()
{
    //iPad detection and fix various issues.
    var isIpad = (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)) != null;
    if(isIpad) {
        $('.help_box').each(function() {
            var id = $(this).children('div').attr('id');

            $(this).bind('touchstart touchend touchmove click', function() {
                show_help(id);
            });
        });
        $('#header .helpbox > h4').bind('touchend', function() {
            if(help_active) {
                help_active = false;
                $("[id*='hlp']").css('display', 'none');
                return false;
            }
        });
        //Informs the user how to close the box once they make it appear
        $('#header .helpbox > h4').each(function() {
            $(this).html($(this).html() + " - Tap Here To Close"); 
        });
        $('#fancybox-close').css('right', '-12px');
    } else {
        $('.help_box').each(function() {
            var id = $(this).children('div').attr('id');

            $(this).mouseover(function() {
                show_help(id);
            });
            $(this).mouseout(function() {
                help_start_timer(id);
            });

        });
        $(".helpbox > h4").click(function() {
            help_active = false;
            $("[id*='hlp']").css('display', 'none');
            return false;
        });
    }
}

function qs_call(obj)
{
    if (obj.id)
    {
        gotoCurrentReport(obj.id);
    }
}

function gotoCurrentReport(urlvars)
{
    var href = ajax_ahd_current_report + "?" + urlvars;

    if (ajax_ahd_current_report_vars)
        href += "&" + ajax_ahd_current_report_vars;

    if (ajax_ahd_current_report_section)
        href += "#" + ajax_ahd_current_report_section;

     //alert(href); return;
    window.location = parseURL(href);
}

/* 
 * manage list functions
 */

var newlistname;
var listnames;
var oldlistname;
var copylistid;
var renamelistid;

function ahd_prompt_listname_unique_prompt(action, level)
{
    var prompttext  = "";
    var titletext   = "";

    switch (action)
    {
        case "createnewlist":
            titletext   = "Create New List";
            prompttext  = "New List Name";
            break;

        case "copylist":
            titletext   = "Copy List";
            prompttext  = "New List Name";
            break;

        case "renamelist":
            titletext   = "Rename List";
            prompttext  = "New List Name";
            break;

    }

    if (level > 0)
        prompttext += "\nSorry, a list with that name already exists";

    var defaultname;
    if (action == "createnewlist")
        defaultname = defaultlistname;
    else
        defaultname = oldlistname;
        
    jPrompt(prompttext, defaultname, titletext, 
        function (listname) 
        {
            if (listname)
            {
                // make sure the listname is not the default
                // and not already an existing list name
                if (listname != defaultlistname && $.inArray(listname.toLowerCase(), listnames) == -1)
                {
                    // new listname does not exist in current listnames
                    // so is unique
                    newlistname = listname;

                    switch (action)
                    {
                        case "createnewlist":
                            ahd_newlist_callback(newlistname);
                            break;

                        case "copylist":
                            ahd_copylist_callback(newlistname);
                            break;

                        case "renamelist":
                            ahd_renamelist_callback(newlistname);
                            break;
                    }
                }
                else
                {
                    // not a unique name
                    ahd_prompt_listname_unique_prompt(action, ++level);
                }
            }
        }
        );
}
function ahd_prompt_listname_unique(action)
{
    $.ajax({
        url: "/managelist.php?action=getlistnames&jsaction=" + action, 
        dataType: "json",
        data: {},
        success: function (data) { 
            listnames = data.listnames;
            ahd_prompt_listname_unique_prompt(data.jsaction, 0);
            },
        error: function (data) { 
            // location.reload(true);
        }
    });
}

function ahd_build_referer_href()
{
    var referer     = window.location.pathname + window.location.search;
    /* trim off the leading slash */
    referer         = referer.substring(1);
    return referer;
}

function ahd_newlist_callback(newlistname)
{
    // newlistname can be null if a user cancels the prompt
    if (newlistname)
    {
        window.location = parseURL("/managelist.php?action=createnewlist&createnewlistname=" + escape(newlistname) + "&referer=" + escape(ahd_build_referer_href()));
    }
}
function ahd_ml_show_list_contents(listid)
{
    var tdid        = "list_contents-" + listid;
    var trid        = "trlist-" + listid;
    var trlistid    = "listid-" + listid;

    // see if the td exists
    if ($('#' + tdid).length == 0)
    {
        // create it
        $('#' + trlistid).after('<tr id="' + trid + '"><td colspan="3" id="' + tdid + '">loading...</td></tr>');

        // populate it
        $('#' + tdid).load('ajax/viewlist.php?listid=' + listid);

    }
    else
    {
        // toggle viewable
        if ($('#' + trid).is(':visible'))
            $('#' + trid).hide();
        else
            $('#' + trid).show();
    }
}
function ahd_ml_removeall()
{
    window.location = parseURL("/managelist.php?action=emptylist");
}
function ahd_ml_copy(listid, copyname)
{
    if (!listid)
    {
        alert("list id is required");
        return;
    }

    copylistid = listid;
    oldlistname = copyname;

    ahd_prompt_listname_unique("copylist");
}
function ahd_copylist_callback(newlistname)
{
    if (newlistname)
    {
        window.location = parseURL("/managelist.php?action=copylist&copylistid=" + copylistid + "&newlistname=" + escape(newlistname) + "&referer=" + escape(ahd_build_referer_href()));
    }
}
function ahd_ml_rename(listid, oldname)
{
    if (!listid)
    {
        alert("list id is required");
        return;
    }

    renamelistid = listid;
    oldlistname = oldname;

    ahd_prompt_listname_unique("renamelist");
}
function ahd_ml_map(listid)
{
    if (!listid)
    {
        alert("list id is required");
        return;
    }

    window.location = parseURL("list_cms.php?listid=" + listid + "&viewmap=1");

}

function ahd_renamelist_callback(newlistname)
{
    if (newlistname)
    {
        window.location = parseURL("/managelist.php?action=renamelist&renamelistid=" + renamelistid + "&newlistname=" + escape(newlistname) + "&referer=" + escape(ahd_build_referer_href()));
    }
}
function ahd_ml_options_init()
{
    $("#savedlists").click(function (e) {
        var eclass      = $(e.target).attr('class');
        var ehref       = $(e.target).attr('href');
        var tablerow    = $(e.target).parent().parent();
        var listidattr  = tablerow.attr('id');
        var listid      = listidattr.substring(7); // remove the "listid-" portion
        var listname    = tablerow.children('.listname').html();
        var rtn         = false;

        switch (eclass)
        {
            case "listmap":
                // do nothing, but return true
                rtn = true;
                break;

            case "listload":
                // do nothing, but return true
                rtn = true;
                break;


            case "listcopy":
                ahd_ml_copy(listid, listname);
                break;


            case "listrename":
                ahd_ml_rename(listid, listname);
                break;


            case "listdelete":
                var message = "Are you sure you want to delete this list?";

                jConfirm(message, "Delete List?", function (result) {
                    if (result)
                        window.location = parseURL(ehref);
                });
                break;


            case "listshowhospitals":
                ahd_ml_show_list_contents(listid);
                break;
        }
        
        return rtn;
    });
}


var help_timer;
var help_active;

function help_start_timer(divid)
{
    if(help_active) {
        help_timer = setTimeout(function() { hide_help(divid); }, 250);
    }
}
function help_kill_timer()
{
    clearTimeout(help_timer);
}

function show_help(divid, top, left)
{
    help_kill_timer();
    if (help_active)
        hide_help(help_active);

    help_active = divid;
    var mydiv = document.getElementById(divid);
    if (mydiv)
    {
        $(mydiv).css('position', 'absolute');
        $(mydiv).css('display', 'block');
        $(mydiv).css('top', 'auto');

        if(!isVisible(mydiv)) {
            var elemTop = $(mydiv).offset().top;
            var elemBottom = elemTop + $(mydiv).height();
                
            $(mydiv).css('top', elemTop - $(mydiv).height() - 160);
        }
        $(mydiv).css('position', 'absolute');
   }
}
function isVisible(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return ((docViewTop < elemTop) && (docViewBottom > elemBottom));
}
function hide_help(divid)
{
    var mydiv = document.getElementById(divid);
    if (mydiv)
        mydiv.style.display = "none";
}

function addToActiveList(urlvars)
{
    $.getJSON('/managelist.php?action=addtolist&' + urlvars,
        function(json) {

            var loadurl = '/ajax/viewactivelist.php?referer=' + escape(ahd_build_referer_href());

            if(json.status == 'added') {
                $('#foldermsg-'+json.provid).html(' remove from active list');
                $('#addtolist_button').attr('src', '/images/button_removefromlist.png');
                $('#addtolist_button').attr('alt', '-List');
                $('#activelistcontent').load(loadurl);
             } else {
                $('#foldermsg-'+json.provid).html(' add to active list');
                $('#addtolist_button').attr('src', '/images/button_addtolist.png');
                $('#addtolist_button').attr('alt', '+List');
                $('#activelistcontent').load(loadurl);
            }
        }
    );
}

function ahd_save_report_section(link)
{
    var section = new String(link);

    // get the hash / named anchor / section from the link
    var i = section.lastIndexOf("#");

    if (i)
    {
        section = section.substring(i + 1);
        ajax_ahd_current_report_section = section;

        var url = "ajax/savereportsection.php?report=" + ajax_ahd_current_report + "&section=" + section;
        $.ajax({url: url});
    }
}

/**
  * SEARCH RESULTS TOOLS
  *
  *
  **/

var searchListChanges = 0;

function disableBeforeUnload() { window.onbeforeunload = null; }

window.onbeforeunload = function (evt)
{
    if (searchListChanges > 0)
    {
        var message = "You have unsaved changes.";
        if (typeof evt == "undefined")
            evt = window.event;

        if (evt)
            evt.returnValue = message;

        return message;
    }
}


function addAllToActiveList(url)
{
    // if add all is checked, add all
    // if add all is unchecked, remove all
    var form = document["getElementById"]("list_cms");
    var objAddAll = form["addalltolist"];
    var CheckValue;
    var urlaction;

    if (objAddAll.checked)
    {
        CheckValue  = true;
        urlaction   = "addall";
    }
    else
    {
        CheckValue  = false;
        urlaction   = "removeall";
    }

    // build list of provids
    // var provids_url = "";

    var objCheckBoxes = form["provid[]"];
    var countCheckboxes = objCheckBoxes.length;

    for (var i = 0; i < countCheckboxes; ++i)
    {
        objCheckBoxes[i].checked = CheckValue;
    }

    if (typeof searchListChanges != "undefined")
    {
        if (CheckValue)
            searchListChanges = countCheckboxes;
        else
            searchListChanges = 0;
    }
}

function getCountyList(sel)
{
    var fipsstate = sel.options[sel.selectedIndex].value;

    $.ajax({
        url: 'ajax/getcounties.php?fipsstate=' + fipsstate,
        success: function(data) {
            var element = document.getElementById('fipscounty[]');
            $(element).remove();

            $("#county_search").html(data); 
        }
    });
}

function popupWin(form, fieldname)
{
    fieldname = typeof(fieldname) != 'undefined' ? fieldname : 'code';

 //   if (!window.focus) return true;
    // windowname cannot contain non-alphanumeric characters or IE will croak
    // myregexp = new RegExp("[^0-9A-Za-z]");
    myregexp = new RegExp('[^\\da-z]', 'gi');
    var windowname = $('#' + fieldname).val().replace(myregexp, "");

    if (windowname == "")
        windowname = "ahd_generic";
        
    form.target=windowname;
    sealWin=window.open('', windowname, 'height=770px, width=680px, scrollbars=yes',"gl");
    if (window.focus) { sealWin.focus() }
//    return false;
}
function popUp(url) 
{
    // trim off leading slash (if there)
    if (url.substring(0,1) == '/')
    {
        url = url.substring(1);
    }

    if (url.substring(0,7) != 'http://' && url.substring(0,8) != 'https://')
    {
        base = document.getElementById('myBaseId');
        url = base.href + url;
    }
    sealWin=window.open(url,"win",'toolbar=0,location=0,directories=0,status=1,menubar=1,scrollbars=1,resizable=1,width=550,height=350',"gl");
    if (window.focus) { sealWin.focus() }
    self.name = "mainWin";
}
function popUpFull(url) {
    // trim off leading slash (if there)
    if (url.substring(0,1) == '/')
    {
        url = url.substring(1);
    }

    if (url.substring(0,7) != 'http://' && url.substring(0,8) != 'https://')
    {
        base = document.getElementById('myBaseId');
        url = base.href + url;
    }
    sealWin=window.open(url,"win",'toolbar=0,location=0,directories=0,status=1,menubar=1,scrollbars=1,resizable=1,width=785,height=550',"gl");
    if (window.focus) { sealWin.focus() }
    self.name = "mainWin";
}
function popUpOpts(url,x,y,scrolly) {
    base = document.getElementById('myBaseId');
    sealWin=window.open(base.href + url,"win",'toolbar=0,location=0,directories=0,status=1,menubar=1,scrollbars=' + scrolly + ',resizable=1,width=' + x + ',height=' + y,"gl");
    if (window.focus) { sealWin.focus() }
    self.name = "mainWin";
}
function input_clear(obj)
{
    $("#" + obj).val("");
}

function ahd_fofinterest_init()
{
    $('#fofinterest').change(ahd_check_fofinterest);
    ahd_check_fofinterest();
}
function ahd_check_fofinterest()
{
    if ($('#fofinterest').val() == 'Other')
        $('#fofinterest_other').show();
    else
        $('#fofinterest_other').hide();
}

//
// state_urlvars:
// for repopulating the state selector
// 
// cc:
// the two ahd_state_other_* functions are both called on
// two pages: order_form and place_order
// the cc flag uses the object names for the
// place order (credit card) page
//
function ahd_state_other_init(state_urlvars, cc)
{
    if (typeof cc == "undefined") cc = false;
    var obj_country     = (cc) ? '#ccountry' : '#country';

    $(obj_country).change(function () { ahd_state_other_check(state_urlvars, cc); });
    ahd_state_other_check(state_urlvars, cc);
}
function ahd_state_other_check(state_urlvars, cc)
{
    if (typeof state_urlvars == "undefined") state_urlvars = '';
    if (typeof cc == "undefined") cc = false;

    var obj_country     = (cc) ? '#ccountry' : '#country';
    var obj_state       = (cc) ? '#cstate' : '#state';
    var obj_state_other = (cc) ? '#cstateother' : '#state_other';

    if ($(obj_country).val() == 'US' || $(obj_country).val() == 'CA')
    {
        $(obj_state).show();
        $(obj_state_other).hide();

        var url = '/ajax/getstates.php?country=' + $(obj_country).val() + '&' + state_urlvars;
        $.getJSON(url, null, function(data) {
            $(obj_state).html('');
            $(obj_state).addItems(data);
        });
    }
    else
    {
        $(obj_state).hide();
        $(obj_state_other).show();
    }
}
$.fn.addItems = function(data) {
    return this.each(function() {
        var list = this;
        $.each(data, function(index, itemData) {
            list.options[list.options.length] = new Option(itemData.Label, itemData.Value, false, itemData.Selected == "true");
        });
    });
};

function ahd_myaccount_news_init()
{
    $(".newsdismiss").css({
        "display"       : "block",
        "float"         : "right",
        "margin-left"   : "15px",
        "margin-bottom" : "15px"
        });

    $(".newsdismiss:first").parent().css("border", "none");

    $(".newsdismiss").click(function() {
        var articleobj  = $(this).parent();
        var articleid   = articleobj.attr("id").substring(10);

        articleobj.slideUp(400, function() { 
            // remove the news article
                        $(this).remove(); 
        });

        if ($('.newsdismiss').length == 1) {
            $('#news').parent().remove();
        }

        $.ajax({
            url: "ajax/dismiss_news.php?articleid=" + articleid
            });
    });

    
}

function ahd_set_focus(objid)
{
    $("#" + objid).focus();
}
