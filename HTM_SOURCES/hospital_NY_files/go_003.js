(function($){
    var Autosuggest = function(element, options)
    {

        var elem = $(element);
        var elemid = '#as_' + elem.attr('id');
        var obj = this;

        var settings = $.extend({
            id: '',
            hidden_id: '',
            max_results: 100,
            act_as_dropdown: false,
            no_resultsMessage: 'No results',
            min_characters: 2,
            ajax_page: '',
            redirect_page: '',
            auto_populate: false,
            submit_if_selected: false,
            submit_if_one_result: false,
            submit_as_form: false,
            before_focus_message: false,
            pulldown: false,
            callback_on_click: false,
        }, options || {});

        var priv =  {
            timeoutSet: false,
            main_timeout: '',
            mouse_timeout: '',
            html: '',
            value: '',
            stop: false
        };

        this.stopAutoSuggest = function() {
            priv.stop = true;
        }

        // Public method - can be called from client code
        this.setAutoSuggest = function()
        {
            if (settings.hidden_id == "" && settings.id != "")
                settings.hidden_id = settings.id + "_hidden";

            if (settings.before_focus_message == true)
                settings.before_focus_message = "enter keywords";

            elem.attr('autocomplete', 'off');

            elem.keyup(function(event) {
                priv.value = $(this).val();
                value = $(this).val();

                if($(this).val().length > settings.min_characters) {
                   if(!priv.timeoutSet) {
                       priv.main_timeout = setTimeout(function() { performAjaxCall(value) }, 1500);
                       priv.timeoutSet = true;
                   }
                }
             });

             elem.click(function() {
                if(priv.html != '' && (priv.value == '.' || priv.value == elem.val()) && (elem.val() != '' || priv.value == '.')) {
                     $(elemid).show();
                } else {
                    if(elem.val() != '') {
                        priv.value = $(elem).val();
                        performAjaxCall(elem.val());
                    } else {
                        if(settings.auto_populate) {
                            performAjaxCall('.');
                            priv.value = '.';
                        }
                    }
                }
             });

             $(document).scroll(function() {
                 $(elemid).hide();
             });

             $('#main').scroll(function() {
                 $(elemid).hide();
                 priv.html = '';
             });


            if(settings.before_focus_message != false) {
                if(elem.val() == '') {
                    elem.val(settings.before_focus_message);
                    elem.focus(function () {
                        elem.val("");
                        elem.focus = null;
                    });
                }
            }

            if(settings.pulldown) {
                $('#' + elem.attr('id') + '_pulldown').click(function() {
                    $('#' + elem.attr('id')).focus();
                    setTimeout("$('#" + elem.attr('id') + "').click()", 100);
                });
            }

         };

         // Private method - can only be called from within this object
         var performAjaxCall = function(value)
         {
            if(!priv.stop) {
                if((priv.value != '.' && value != priv.value) && value.length > settings.min_characters) {
                    priv.main_timeout = setTimeout(function() { performAjaxCall(value) }, 1500);
                    priv.timeoutSet = true;
                    return;
                }
                priv.timeoutSet = false;
                priv.value = value;


                pathArray = window.location.href.split( '/' );
                protocol = pathArray[0];
                host = pathArray[2];
                url = protocol + '//' + host + '/';

                $.ajax({
                    url: url + settings.ajax_page + "input=" + value,
                    success: function(data) {
                        buildResults(data)
                    }
                });
            } else {
                priv.stop = false;
                priv.value = '';
                priv.html = '';
                $(elemid).remove();
            }

         };

         var buildResults = function(data) {
            if(!priv.stop) {

                if(settings.submit_if_one_result) {
                    if(data.results.length == 2) {
                        gotoCurrentReport(data.results[1].id);
                    }
                }

                $(elemid).remove();
                html = $("<div/>", {
                    'id' : 'as_' + elem.attr('id'),
                    'class' : 'autosuggest',
                    'style': 'left:' + elem.offset().left + 'px; top: ' + (elem.offset().top + 11) + 'px;',
                    'html' : function() {
                        html = $('<ul />', { id: 'as_ul_' + elem.attr('id') });
                        for(var i = 0; i < data.results.length; i++) {
                            html.append('<li id="' + data.results[i].id + '"><a href="#"><span>' + data.results[i].value + '</span></a></li>');
                        }
                        return html;
                    }
                });
                priv.html = html;
                html.appendTo("body");

                $(elemid + ' ul li a').click(function(event) { event.preventDefault(); return; });

                $(elemid + ' ul li').mouseover(function() {
                    $('.as_highlight').removeClass('as_highlight');
                    $(this).addClass('as_highlight');
                });
                $(elemid + ' ul li').click(function () {
                    if(settings.hidden_id != '') {
                        elem.val($(this).text());
                        $('#' + settings.hidden_id).val($(this).attr('id'));
                        $(elemid).hide();
                    }

                    if(typeof settings.callback_on_click == 'function') {
                      settings.callback_on_click(this);
                      event.preventDefault();
                      event.stopPropagation();
                      event.stopImmediatePropagation();

                    }

                    if(settings.submit_as_form == false && settings.redirect_page == '' && settings.submit_if_selected == true) {
                        gotoCurrentReport($(this).attr('id'));
                    } else if(settings.submit_as_form == true && settings.submit_if_selected == true) {
                        elem.closest("form").find("input[type=submit]").click();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                    } else if(settings.redirect_page != '' && settings.submit_if_selected == true) {
                        url = settings.redirect_page + "?" + $(this).attr('id');
                        window.location = parseURL(url);
                    }

                    $(elemid).hide();
                });
                $(elemid).mouseover(function() {
                    clearTimeout(priv.mouse_timeout);
                });
                $(elemid).mouseout(function() {
                    priv.mouse_timeout = setTimeout(function() { $(elemid).hide(); }, 500);
                });

            } else {
                priv.stop = false;
                priv.value = '';
                priv.html = '';
                $(elemid).remove();
            }
         }
     };

    $.fn.autosuggest = function(options)
    {
        return this.each(function()
            {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('autosuggest')) return;

            // pass options to plugin constructor
            var autosuggest = new Autosuggest(this, options);

            // Store plugin object in this element's data
            element.data('autosuggest', autosuggest);
        });
    };
})(jQuery);
