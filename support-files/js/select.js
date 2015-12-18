/*
 * This file has been created by Ergosign GmbH - All rights reserved - http://www.ergosign.de
 * DO NOT ALTER OR REMOVE THIS COPYRIGHT NOTICE OR THIS FILE HEADER.
 *
 * This file and the code contained in it are subject to the agreed contractual terms and conditions,
 * in particular with regard to resale and publication.
 */

/**
 * This class represents ...
 *
 * Class history:
 *  - 0.1: First release, working (frankb)
 *
 * @author frankb
 * @date 22.10.15
 * @constructor
 */

$(document).ready(function()
{
    var modifierContainer = $('.modifier-select').next('div').find('.kss-modifier__container');
    //modifierContainer.hide();
    $('.kss-modifier__wrapper .modifier-select').change(function(ev)
    {
        var selector = $(this).val();
        var offset = $('body').scrollTop();

        if (selector === 'all')
        {
            $(this).next('div').find('.kss-modifier__container').show();
        }
        else
        {
            console.log("open " + selector);
            $(this).next('div').children().hide();
            //$(this).next('div').find(selector).parents('.kss-modifier__container').show();
            var idx = this.selectedIndex;
            if(idx > 1)
                $(this).next('div').children().eq(parseInt(idx-2)).show();
        }

        $('body').scrollTop(offset);
    });
});