var rootEntryObserver;
var $entryChildrenList;
var host = '';
var protocol = 'https://';
var NEW_WI_TABLE_ID = 'NEW-WI-TABLE',
        EXISTING_WI_TABLE_ID = 'EXISTING-WI-TABLE',
        LINK_MATRIX_TABLE_ID = 'LINK-MATRIX-TABLE',
        REFRESH_LINK_MATRIX_BUTTON_ID = 'REFRESH-LT-MATRIX-BUTTON',
        COLUMN_DISPLAY_TABLE_ID = 'COLUMN-DISPLAY-TABLE',
        PRESENT_ATT_TABLE_ID = 'PRESENT-ATT-TABLE',
        ALL_ATT_TABLE_ID = 'ALL-ATT-TABLE';
var NEW_ID = 'NEW_STATUS',
        UPDATE_ID = 'UPDATE_STATUS';
var paNameList = [],
        paCategoryList = [],
        paTimelineList = [],
        paIterationList = [],
        paEnumerationList = [],
        paWorkflowsList = [],
        paUserList = [],
        paUserByIdList = [],
        paTypeList = [],
        paLinkTypeList = [],
        paConfigStateIdList = [],
        paLinkTypeMatrixList = [],
        paLinkTypeUpdateMappingList = [];
var projectAreaList = [];
function ProjectArea(paId) {
    this.paId = paId;
    this.label = "";
    this.workitemTypeId;
    this.workitem = [];
    //Additional array to control the attributes of each workitem types
    this.workitemAttributes = [];
    this.getName = function () {
        return paNameList[this.paId];
    };

    this.getConfigurationStateId = function () {
        return paConfigStateIdList[this.paId];
    };

    this.getWorkitemTypeId = function () {
        $.ajax({
            url: protocol + host + '/ccm/service/com.ibm.team.workitem.service.process.internal.rest.IWorkItemConfigRestService/workItemTypes?projectAreaItemId=' + this.paId,
            headers: {
                'Accept': 'text/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            paId: this.paId,
            success: function (data) {
                var types = data['soapenv:Body']['response']['returnValue']['value']['types'],
                        builtInAttributes = data['soapenv:Body']['response']['returnValue']['value']['builtInAttributes'],
                        customAttributes = data['soapenv:Body']['response']['returnValue']['value']['customAttributes'];
                projectAreaList[this.paId].workitemTypeId = data['soapenv:Body']['response']['returnValue']['value'];
                projectAreaList[this.paId].workitem = types;
                for (var counter = 0; counter < types.length; counter++) {
                    var itemId = types[counter]['id'],
                            category = types[counter]['category'],
                            customAttributeCounter = counter;
                    projectAreaList[this.paId].workitemAttributes.push(itemId);
                    projectAreaList[this.paId].workitemAttributes[itemId] = [];
                    for (var builtInAttributeIndex in builtInAttributes) {
                        var builtInAttribute = builtInAttributes[builtInAttributeIndex];
                        projectAreaList[this.paId].workitemAttributes[itemId].push(builtInAttribute['id']);
                        projectAreaList[this.paId].workitemAttributes[itemId][builtInAttribute['id']] = builtInAttribute;
                    }

                    if (customAttributes[counter]['category'] !== category) {
                        for (var _CACounter = 0; _CACounter < customAttributes.length; _CACounter++) {
                            if (customAttributes[_CACounter]['category'] === category) {
                                customAttributeCounter = _CACounter;
                                break;
                            }
                        }
                    }

                    for (var customAttributeIndex in customAttributes[customAttributeCounter]['attributes']) {
                        var customAttribute = customAttributes[customAttributeCounter]['attributes'][customAttributeIndex];
                        projectAreaList[this.paId].workitemAttributes[itemId].push(customAttribute['id']);
                        projectAreaList[this.paId].workitemAttributes[itemId][customAttribute['id']] = customAttribute;
                    }
                }
            },
            error: function () {
                console.error('#ERROR: getWorkitemTypeId: Error retriving project area ' + this.label + ' workitem types information.');
            }
        });
    };
}
var workitemList = [];
function Workitem(id, type, paId) {
    this.id = id;
    this.summary = "";
    this.description = "";
    this.type = type;
    this.paId = paId;
    this.itemId = "";
    this.stateId = "";
    this.locationUri = "";
}
var linktypeEnable = 'com.ibm.team.workitem.linktype.',
        linkTypeEnableList = [],
        linkTypeEnableHeaderList = [],
        listTypeEnableCorespondList = [],
        linkTypeNameList = [],
        linkTypeEnableImgList = [],
        linktype = [],
        linkTypeMatrix = [],
        createWorkitemMatrix = [];
var newWorkitemPresentCounter = 0,
        newWorkitemTotalCounter = 0,
        fetchDTO2WorkitemPresentCounter = 0,
        fetchDTO2WorkitemTotalCounter = 0,
        presentWorkitemRowIndex = 0;
var wiAttributes = [],
        defaultWiAttributes = [];
var imgDeleteButton = '/extensions/com.bosch.rtc.autocreateworkitem/img/delete-button.gif',
        imgMoveUpButton = '/extensions/com.bosch.rtc.autocreateworkitem/img/move-up.png',
        imgMoveDownButton = '/extensions/com.bosch.rtc.autocreateworkitem/img/move-down.png',
        imgLinkTypeBundle = '/extensions/com.bosch.rtc.autocreateworkitem/img/linktypebundle.png',
        imgLinkTypeStartLink = '<span style="display: inline-block; width: 16px; height: 16px; background: transparent url(/extensions/com.bosch.rtc.autocreateworkitem/img/linktypebundle.png) ',
        imgLinkTypeEndLink = ';"></span>&nbsp;',
        imgLinkTypeStyleStatLink = 'display: inline-block; width: 16px; height: 16px; background: transparent url(/extensions/com.bosch.rtc.autocreateworkitem/img/linktypebundle.png) ',
        imgLinkTypeStyleEndLink = ';';
var imageList = [],
        imageStartNonImgLink = '<span class="button-img" style="display: inline-block; width: 16px; height: 16px; background: transparent url(/extensions/com.bosch.rtc.autocreateworkitem/img/', //missing file_name+)+position
        imageEndNonImgLink = ' ;"></span>';
var linkMatrixMapping = [];
var REGEX_LAST_URI_PATH = /[^\/]+(?=\/$|$)/;
var CharSpace = '&nbsp;',
        StringClickAddText = 'Click to add text...';
var colorFontGray = '#696969',
        colorFontBlack = '#000000',
        colorBorderRed = '2px solid #FF0000',
        colorBorderGreen = '2px solid #00FF00',
        colorBorderYellow = '2px solid #FFFF33',
        colorBorderNone = '1px solid transparent',
        colorBorderBottmNone = '1px solid #ddd',
        colorBackgroundGray = '#696969',
        colorBackgroundOrange = '#FFEACF';
$(document).ready(function () {
    console.log('===================================');
    console.log('#INFO: Init: Initializing widget...');
    host = window.location.host;
    console.log('#INFO: Init: host=' + host);
    $(window.top).bind('hashchange', function () {
        console.log('Hash changed!');
    });
    initConstantList();
    initParamenters();
    getAllProjectAreaNames();
    disableWidget();
    enableWidget();
    initUi();
});
function initUi() {
    info('The automatic workitem creation Widget is ready to be used.');
    $('#' + COLUMN_DISPLAY_TABLE_ID).hide();
    $('#COLUMN-DISPLAY-BUTTONS').hide();
    $('#TEMPLATE-CONFIG').hide();
    $('#button-create-new-workitem').click(function () {
        createNewWorkitemTable();
    });
    $('#button-fetch-existing-workitem').click(function () {
        var wiId = $('#textbox-workitem-id').val(),
                rowIndex = $('#' + EXISTING_WI_TABLE_ID + ' tr').length,
                duplicateFlag = false;
        for (var counter = 1; counter < $('#' + LINK_MATRIX_TABLE_ID + ' tr').length; counter++) {
            var cells = $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td');
            if (typeof cells[counter - 1].getAttribute('wiId') !== 'undefined') {
                if (wiId === cells[counter - 1].getAttribute('wiId')) {
                    duplicateFlag = true;
                }
            }
        }

        if (duplicateFlag) {
            error('The workitem having Id "' + wiId + '" existed.');
        } else {
            fetchExistingWorkItemInfoById(wiId, rowIndex, EXISTING_WI_TABLE_ID, false);
        }
    });
    $('#button-create-update-wi').click(function () {
        //Global variables to check the creation progress
        newWorkitemPresentCounter = 0;
        newWorkitemTotalCounter = 0;
        fetchDTO2WorkitemPresentCounter = 0;
        if ($('#' + NEW_WI_TABLE_ID + ' tr:not(:first-child)').length === 0) {
            updateLinkTypeMapping();
        } else {
            var newWiIdIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="dc:identifier"]').index();
            for (var counter = 1; counter < $('#' + NEW_WI_TABLE_ID + ' tr').length; counter++) {
                var row = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (counter + 1) + ')');
                if (row.find('td:nth-child(' + (newWiIdIndex + 1) + ')').html() !== 'NEW') {

                } else {
                    newWorkitemTotalCounter++;
                }
            }
            fetchDTO2WorkitemTotalCounter = newWorkitemTotalCounter;
            createUpdateWorkitems(1);
        }
    });
    $('#button-load-template').click(function () {
        loadFileFromLocal();
    });
    $('#button-save-template').click(function () {
        saveTemplateToLocalFile();
    });

    $('#button-refresh-link-matrix').click(function () {
        refreshLinkTypeMatrix(); //HHM1HC missing
    });
    $('#Column-display').click(function () {
        if ($('#' + COLUMN_DISPLAY_TABLE_ID).css('display') === 'none') {
            $('#' + COLUMN_DISPLAY_TABLE_ID).show();
            $('#COLUMN-DISPLAY-BUTTONS').show();
            $('#TEMPLATE-CONFIG').hide();
            $('#Column-display').addClass('chosen');
            $('#Template').removeClass('chosen');
        } else {
            $('#' + COLUMN_DISPLAY_TABLE_ID).hide();
            $('#COLUMN-DISPLAY-BUTTONS').hide();
            $('#Column-display').removeClass('chosen');
        }
    });
    $('#Template').click(function () {
        if ($('#TEMPLATE-CONFIG').css('display') === 'none') {
            $('#TEMPLATE-CONFIG').show();
            $('#' + COLUMN_DISPLAY_TABLE_ID).hide();
            $('#COLUMN-DISPLAY-BUTTONS').hide();
            $('#Column-display').removeClass('chosen');
            $('#Template').addClass('chosen');
        } else {
            $('#TEMPLATE-CONFIG').hide();
            $('#Template').removeClass('chosen');
        }
    });
    initColumnDisplay();
}
function initColumnDisplay() {
    for (var counter = 0; counter < wiAttributes.title.length; counter++) {
        appendRow(ALL_ATT_TABLE_ID);
        $('#' + ALL_ATT_TABLE_ID + ' tr:last td:first').html(wiAttributes.title[counter] + ' <span class="button-img" style="display: inline-block; float: right; width: 16px; height: 16px; background: transparent url(/extensions/com.bosch.rtc.autocreateworkitem/img/editbundle.png) -67px -25px ;"/>');
        $('#' + ALL_ATT_TABLE_ID + ' tr:last td:first').attr('itemId', wiAttributes.oslcName[counter]);
        appendRow(PRESENT_ATT_TABLE_ID);
        $('#' + PRESENT_ATT_TABLE_ID + ' tr:last td:first').html(wiAttributes.title[counter] + ' <img class="button-img" src="/extensions/com.bosch.rtc.autocreateworkitem/img/delete-button.gif" style="float:right;"/>');
        $('#' + PRESENT_ATT_TABLE_ID + ' tr:last td:first').attr('itemId', wiAttributes.oslcName[counter]);
        if (defaultWiAttributes.indexOf(wiAttributes.oslcName[counter]) !== -1) {
            $('#' + ALL_ATT_TABLE_ID + ' tr:last').hide();
        } else {
            $('#' + PRESENT_ATT_TABLE_ID + ' tr:last').hide();
        }
    }

    $('#' + ALL_ATT_TABLE_ID + ' .button-img').click(function () {
        var att = $(this).parent().attr('itemId');
        $(this).parent().parent().hide();
        console.log(att, $('#' + PRESENT_ATT_TABLE_ID).find("td[itemId='" + att + "']"));
        $('#' + PRESENT_ATT_TABLE_ID).find("td[itemId='" + att + "']").removeClass('chosen').parent().show();
    });
    $('#' + PRESENT_ATT_TABLE_ID + ' .button-img').click(function () {
        var att = $(this).parent().attr('itemId');
        $(this).parent().parent().hide();
        console.log(att, $('#' + ALL_ATT_TABLE_ID).find("td[itemId='" + att + "']"));
        $('#' + ALL_ATT_TABLE_ID).find("td[itemId='" + att + "']").removeClass('chosen').parent().show();
    });
    $('.column-display').find('td').click(function () {
        $(this).toggleClass('chosen');
    });
    $('#' + ALL_ATT_TABLE_ID + ' caption text:first').click(function () {
        for (var counter = 0; counter < $('#' + ALL_ATT_TABLE_ID + ' tr').length; counter++) {
            var trRow = $('#' + ALL_ATT_TABLE_ID + ' tr:nth-child(' + (counter + 2) + ')');
            if (trRow.attr('display') !== 'none') {
                if (trRow.find('td:first').attr('class') === 'chosen') {
                    var att = trRow.find('td:first').attr('itemId');
                    trRow.hide();
                    $('#' + PRESENT_ATT_TABLE_ID).find("td[itemId='" + att + "']").removeClass('chosen').parent().show();
                }
            }
        }
    });
    $('#' + PRESENT_ATT_TABLE_ID + ' caption text:first').click(function () {
        for (var counter = 0; counter < $('#' + PRESENT_ATT_TABLE_ID + ' tr').length; counter++) {
            var trRow = $('#' + PRESENT_ATT_TABLE_ID + ' tr:nth-child(' + (counter + 2) + ')');
            if (trRow.attr('display') !== 'none') {
                if (trRow.find('td:first').attr('class') === 'chosen') {
                    var att = trRow.find('td:first').attr('itemId');
                    trRow.hide();
                    $('#' + ALL_ATT_TABLE_ID).find("td[itemId='" + att + "']").removeClass('chosen').parent().show();
                }
            }
        }
    });
    $('#' + PRESENT_ATT_TABLE_ID + ' caption text:nth-child(2)').click(function () {
        $.each($("#" + PRESENT_ATT_TABLE_ID + " td[class='chosen']"), function (index, value) {
            if ($(value).parent().index() > 1) {
                $(value).parent().after($(value).parent().prev(':visible:first'));
            }
        });
    });
    $('#' + PRESENT_ATT_TABLE_ID + ' caption text:nth-child(3)').click(function () {
        var chosenObj = $("#" + PRESENT_ATT_TABLE_ID + " td[class='chosen']");
        for (var counter = (chosenObj.length - 1); counter >= 0; counter--) {
            $(chosenObj[counter]).parent().before($(chosenObj[counter]).parent().next(':visible:first'));
        }
    });
    $('#button-cd-cancel').click(function () {
        console.log('Clicked');
    });
    $('#button-cd-apply-setting').click(function () {
        $('#' + NEW_WI_TABLE_ID + ' tr:not(:first-child)').remove();
        $('#' + EXISTING_WI_TABLE_ID + ' tr:not(:first-child)').remove();
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:not(:first-child)').remove();
        $('#' + LINK_MATRIX_TABLE_ID + ' td').remove();
        $('#' + NEW_WI_TABLE_ID + ' tr').each(function () {
            $(this).find('th:not(:first-child)').remove();
        });
        $('#' + EXISTING_WI_TABLE_ID + ' tr').each(function () {
            $(this).find('th:not(:first-child)').remove();
        });

        $("#" + PRESENT_ATT_TABLE_ID + " tr:visible:not(:first-child)").each(function () {
            var attrId = $(this).find('td:first').attr('itemId'),
                    attrName = wiAttributes.title[wiAttributes.oslcName.indexOf(attrId)];
            //HHM1HC: hidden cell patch
            if (attrId !== 'rtc_cm:state' && attrId !== 'dc:creator' && attrId !== 'dc:created') {
                $('#' + NEW_WI_TABLE_ID + ' tr:first').append($('<th>' + attrName + '</th>').attr('itemId', attrId));
            }
            $('#' + EXISTING_WI_TABLE_ID + ' tr:first').append($('<th>' + attrName + '</th>').attr('itemId', attrId));
        });
    });
    for (var counter = 0; counter < wiAttributes.oslcName.length; counter++) {
        if (defaultWiAttributes.indexOf(wiAttributes.oslcName[counter]) !== -1) {
            appendColumnAttribute(NEW_WI_TABLE_ID, wiAttributes.title[counter], wiAttributes.oslcName[counter]);
            appendColumnAttribute(EXISTING_WI_TABLE_ID, wiAttributes.title[counter], wiAttributes.oslcName[counter]);
        }
    }

}
function initConstantList() {
    linkTypeEnableList.push("com.ibm.team.workitem.linktype.duplicateworkitem.duplicates", "com.ibm.team.workitem.linktype.duplicateworkitem.duplicateOf", "com.ibm.team.workitem.linktype.blocksworkitem.blocks", "com.ibm.team.workitem.linktype.blocksworkitem.dependsOn", "com.ibm.team.workitem.linktype.relatedworkitem.related", "com.ibm.team.workitem.linktype.parentworkitem.parent", "com.ibm.team.workitem.linktype.parentworkitem.children", "com.ibm.team.workitem.linktype.resolvesworkitem.resolves", "com.ibm.team.workitem.linktype.resolvesworkitem.resolvedBy", "com.ibm.team.workitem.linktype.cm.affectedByDefect.defect", "com.ibm.team.workitem.linktype.tracksworkitem.tracks", "com.ibm.team.workitem.linktype.trackedworkitem.trackedBy", "com.ibm.team.workitem.linktype.cm.affectsPlanItem.planItem");
    linkTypeNameList.push("Duplicated By", "Duplicate Of", "Blocks", "Depend On", "Related", "Parent", "Children", "Resolves", "Resolved By", "Affected by Defect", "Tracks", "Contribute To", "Affects Plan Item");
    listTypeEnableCorespondList.push("com.ibm.team.workitem.linktype.duplicateworkitem.duplicateOf", "com.ibm.team.workitem.linktype.duplicateworkitem.duplicates", "com.ibm.team.workitem.linktype.blocksworkitem.dependsOn", "com.ibm.team.workitem.linktype.blocksworkitem.blocks", "com.ibm.team.workitem.linktype.relatedworkitem.related", "com.ibm.team.workitem.linktype.parentworkitem.children", "com.ibm.team.workitem.linktype.parentworkitem.parent", "com.ibm.team.workitem.linktype.resolvesworkitem.resolvedBy", "com.ibm.team.workitem.linktype.resolvesworkitem.resolves", "", "", "", "");
    linkTypeEnableImgList.push("-128px -64px", "-128px -32px", "0px -96px", "-64px -112px", "-112px -48px", "-96px -64px", "-96px -96px", "-144px -80px", "-64px -64px", "-32px -112px", "-48px -64px", "-48px -64px", "-96px -80px");
    linkTypeEnableHeaderList.push("rtc_cm:com.ibm.team.workitem.linktype.duplicateworkitem.duplicates", "rtc_cm:com.ibm.team.workitem.linktype.duplicateworkitem.duplicateOf", "rtc_cm:com.ibm.team.workitem.linktype.blocksworkitem.blocks", "rtc_cm:com.ibm.team.workitem.linktype.blocksworkitem.dependsOn", "rtc_cm:com.ibm.team.workitem.linktype.relatedworkitem.related", "rtc_cm:com.ibm.team.workitem.linktype.parentworkitem.parent", "rtc_cm:com.ibm.team.workitem.linktype.parentworkitem.children", "rtc_cm:com.ibm.team.workitem.linktype.resolvesworkitem.resolves", "rtc_cm:com.ibm.team.workitem.linktype.resolvesworkitem.resolvedBy", "calm:affectedByDefect", "oslc_cm:tracksWorkItem", "oslc_cm:trackedWorkItem", "calm:affectsPlanItem");
    wiAttributes.title = [];
    wiAttributes.oslcName = [];
    wiAttributes.wiAttributes = [];
    wiAttributes.method = [];
    wiAttributes.enumerations = [];
    wiAttributes.title.push("Id", "Type", "Project Area", "Summary", "Filed Against", "Planned For", "Description", "Owned By", "Tags", "Priority", "Severity", "Story Points", "Estimate", "Due Date", "Status", "Created By", "Creation Date");
    wiAttributes.oslcName.push("dc:identifier", "dc:type", "rtc_cm:projectArea", "dc:title", "rtc_cm:filedAgainst", "rtc_cm:plannedFor", "dc:description", "rtc_cm:ownedBy", "dc:subject", "oslc_cm:priority", "oslc_cm:severity", "rtc_cm:com.ibm.team.apt.attribute.complexity", "rtc_cm:estimate", "rtc_cm:due", "rtc_cm:state", "dc:creator", "dc:created");
    wiAttributes.wiAttributes.push("id", "workItemType", "projectArea", "summary", "category", "target", "description", "owner", "internalTags", "internalPriority", "internalSeverity", "com.ibm.team.apt.attribute.complexity", "duration", "dueDate", "internalState", "creator", "creationDate");
    wiAttributes.method.push("Number", "Link", "Link", "String", "Link", "Link", "String", "Link", "String", "Link", "Link", "Link", "Number", "String", "Link", "Link", "String");
    wiAttributes.enumerations.push("-", "-", "-", "-", "-", "-", "-", "-", "-", "priority", "severity", "complexity", "-", "-", "-", "-", "-");
    defaultWiAttributes.push("dc:identifier", "dc:type", "rtc_cm:projectArea", "dc:title", "rtc_cm:filedAgainst", "rtc_cm:plannedFor", "dc:description", "rtc_cm:ownedBy");
    imageList.push('refresh', 'add', 'attrDelete', 'attrNew');
    imageList['refresh'] = 'jazz-common.png) -34px -181px';
    imageList['attrDelete'] = 'jazz-common.png) -51px -148px';
    imageList['attrNew'] = 'jazz-common.png) -85px -148px';
    imageList['add'] = 'editbundle.png) -67px -25px';
}
function initParamenters() {
    linkMatrixMapping.push(NEW_WI_TABLE_ID);
    linkMatrixMapping[NEW_WI_TABLE_ID] = [];
    linkMatrixMapping.push(EXISTING_WI_TABLE_ID);
    linkMatrixMapping[EXISTING_WI_TABLE_ID] = [];
}
function disableWidget() {
    $('#button-create-new-workitem')[0].disabled = true;
    $('#button-fetch-existing-workitem')[0].disabled = true;
    $('#button-create-update-wi')[0].disabled = true;
}
function enableWidget() {
    $('#button-create-new-workitem')[0].disabled = false;
    $('#button-fetch-existing-workitem')[0].disabled = false;
    $('#button-create-update-wi')[0].disabled = false;
}
function refreshData() {

}
function loadFileFromLocal() {
    var f = $('#local-file-path').get(0).files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result,
                    jsonTemplate = JSON.parse(contents),
                    attributes = jsonTemplate['ATTRIBUTES'],
                    newWorkitems = jsonTemplate['WORKITEMS'];
            /*Load Attributes*/
            $('#' + NEW_WI_TABLE_ID + ' tr:not(:first-child)').remove();
            $('#' + EXISTING_WI_TABLE_ID + ' tr:not(:first-child)').remove();
            $('#' + LINK_MATRIX_TABLE_ID + ' tr:not(:first-child)').remove();
            $('#' + LINK_MATRIX_TABLE_ID + ' td').remove();
            $('#' + NEW_WI_TABLE_ID + ' tr th:not(:first-child)').remove();
            $('#' + EXISTING_WI_TABLE_ID + ' tr th:not(:first-child)').remove();

            $("#" + PRESENT_ATT_TABLE_ID + ' tr:not(:first-child)').hide();
            $("#" + ALL_ATT_TABLE_ID + ' tr:not(:first-child)').show();
            for (var counter = 0; counter < attributes.length; counter++) {
                var attrId = attributes[counter]['attr'],
                        attrName = wiAttributes.title[wiAttributes.oslcName.indexOf(attrId)];
                $("#" + PRESENT_ATT_TABLE_ID + ' tr:not(:first-child) td[itemId="' + attrId + '"]').parent().show();
                $("#" + ALL_ATT_TABLE_ID + ' tr:not(:first-child) td[itemId="' + attrId + '"]').parent().hide();
                //HHM1HC: hidden cell patch
                if (attrId !== 'rtc_cm:state' && attrId !== 'dc:creator' && attrId !== 'dc:created') {
                    $('#' + NEW_WI_TABLE_ID + ' tr:first').append($('<th>' + attrName + '</th>').attr('itemId', attrId));
                }
                $('#' + EXISTING_WI_TABLE_ID + ' tr:first').append($('<th>' + attrName + '</th>').attr('itemId', attrId));
            }
            /*Load new workitems*/
            loadWorkitemsTotalNumber = newWorkitems.length;
            loadWorkitemsPresentNumber = 0;
            loadLinkTypes = jsonTemplate['LINKTYPES'];
            for (var counter = 0; counter < newWorkitems.length; counter++) {
                appendRow(NEW_WI_TABLE_ID);
                appendRow(LINK_MATRIX_TABLE_ID);
                appendColumn(LINK_MATRIX_TABLE_ID);
            }

            for (var counter = 0; counter < newWorkitems.length; counter++) {
                createNewWorkitemTableWithJSONInfo(newWorkitems[counter], counter + 1);
            }
        };
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}
function createNewWorkitemTableWithJSONInfo(_jsonWiData, _rowIndex) {
    var paId = _jsonWiData['rtc_cm:projectArea'],
            typeId = _jsonWiData['dc:type'],
            htmlLinkMatrixDisplay = '',
            emptyOption = $('<option/>').attr('itemId', 'NA').html('&lt;Not chosen&gt;'),
            emptyComboBox = $('<select/>').append(emptyOption);
    for (var rowCounter = 1; rowCounter < $('#' + NEW_WI_TABLE_ID + ' tr:first th').length; rowCounter++) {
        var columnIndex = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (rowCounter + 1) + ')').index(),
                attrId = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (rowCounter + 1) + ')').attr('itemId'),
                cell = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ') td:nth-child(' + (columnIndex + 1) + ')'),
                data = _jsonWiData[attrId],
                comboBox = $('<select/>');
        switch (wiAttributes.method[wiAttributes.oslcName.indexOf(attrId)]) {
            case 'String':
                switch (attrId) {
                    case 'rtc_cm:due':
                        var today = new Date(),
                                input = $('<input/>'),
                                object = today.getFullYear(),
                                dateData = new Date();
                        cell.css('white-space', 'nowrap');
                        cell.html('<input type="checkbox"/>');
                        if (data !== '') {
                            dateData = new Date(data);
                            cell.find('input:first').prop('checked', true);
                        }
                        input.addClass('short4digits').attr('type', 'number')
                                .attr('min', (object - 50))
                                .attr('max', (object + 50))
                                .attr('value', dateData.getFullYear());
                        cell.append(input.clone()).append('-');
                        input.removeClass('short4digits').addClass('short2digits');
                        input.attr('min', 1)
                                .attr('max', 12)
                                .attr('value', dateData.getMonth() + 1);
                        cell.append(input.clone()).append('-');
                        input.attr('min', 1)
                                .attr('max', 31)
                                .attr('value', dateData.getDate());
                        cell.append(input.clone());
                        break;
                    case 'dc:description':
                        cell.html('<textarea placeholder="' + StringClickAddText + '">' + data + '</textarea>');
                        break;
                    case 'dc:created':
                        cell.html('-');
                        break;
                    case 'dc:title':
                        cell.html('<input type="text" placeholder="' + StringClickAddText + '">');
                        cell.find('input')
                                .val(data)
                                .on('input', function (e) {
                                    if ($(this).val() !== '') {
                                        $(this).parent().css('border', colorBorderNone)
                                                .css("border-bottom", colorBorderBottmNone);
                                    } else {
                                        $(this).parent().css('border', colorBorderRed);
                                    }
                                });
                        break;
                    default:
                        cell.html('<input type="text" placeholder="' + StringClickAddText + '">');
                        cell.find('input').val(data);
                }
                break;
            case 'Link':
                switch (attrId) {
                    case 'dc:type':
                        for (var counter = 0; counter < paTypeList[paId].length; counter++) {
                            var _typeId = paTypeList[paId][counter];
                            comboBox.append(
                                    $('<option/>')
                                    .attr('itemId', _typeId)
                                    .html('<img class="icon-img" src="' + paTypeList[paId][_typeId].iconUrl + '">' + CharSpace + paTypeList[paId][_typeId].title));
                        }
                        cell.html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                .find('img:first').attr('src', paTypeList[paId][typeId].iconUrl);
                        cell.append(comboBox.clone())
                                .css('white-space', 'nowrap')
                                .find('select:first')
                                .prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());
                        htmlLinkMatrixDisplay = cell.find("select:first option:selected").html();
                        cell.find('select:first').change(function () {
                            //If the type is changed, its image and link matrix first cells are changed following the context
                            var rowIndex = $(this).parent().parent().index(),
                                    selectedIndex = this.selectedIndex;
                            $(this).parent().find('img:first').attr('src', paTypeList[paId][paTypeList[paId][selectedIndex]].iconUrl);
                            $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex] + 1) + ')')
                                    .html(this[selectedIndex].innerHTML)
                                    .attr('typeId', $(this[selectedIndex]).attr('itemId'));
                            $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex] + 1) + ') td:first')
                                    .html(this[selectedIndex].innerHTML)
                                    .attr('typeId', $(this[selectedIndex]).attr('itemId'));
                            updateLinkTypeMatrix(NEW_WI_TABLE_ID, rowIndex);
                        });
                        break;
                    case 'rtc_cm:projectArea':
                        comboBox.append($('<option/>').attr('itemId', 'NA').html('&lt;Project Area is not chosen&gt;'));
                        for (var i = 0; i < paNameList.length; i++) {
                            comboBox.append(
                                    $('<option/>')
                                    .attr('itemId', paNameList[i])
                                    .html(paNameList[paNameList[i]])
                                    );
                        }
                        cell.css('white-space', 'nowrap')
                                .html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                .append(comboBox.clone());
                        cell.find('select:first').prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());

                        cell.find('select').change(function () {
                            var rowIndex = $(this).parent().parent().index();
                            $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
                            updateNewWorkitemInfoByPaId(rowIndex, UPDATE_ID);
                        });
                        break;
                    case 'rtc_cm:filedAgainst':
                        for (var counter = 0; counter < paCategoryList[paId].length; counter++) {
                            var itemId = paCategoryList[paId][counter];
                            comboBox.append($('<option/>').attr('itemId', itemId).html(paCategoryList[paId][itemId]));
                        }
                        cell.html('').append(comboBox.clone());
                        cell.find('select:first').change(function () {
                            if ($(this).find('option:selected').html() === 'Unassigned') {
                                $(this).parent().css('border', colorBorderRed);
                            } else {
                                $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
                            }
                        });
                        cell.find('select:first').prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());
                        break;
                    case 'rtc_cm:plannedFor':
                        comboBox = $('<select/>')
                                .append($('<option/>').attr('itemId', 'NA').html('Unassigned'));
                        for (var counter = 0; counter < paIterationList[paId].length; counter++) {
                            var itemId = paIterationList[paId][counter];
                            comboBox.append($('<option/>').attr('itemId', itemId).html(paIterationList[paId][itemId].id));
                        }
                        cell.html('').append(comboBox.clone());
                        cell.find('select:first').prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());
                        break;
                    case 'rtc_cm:ownedBy':
                        comboBox = $('<select/>')
                                .append($('<option/>').attr('itemId', 'NA').html('Unassigned'));
                        for (var counter = 0; counter < paUserList[paId].length; counter++) {
                            var itemId = paUserList[paId][counter];
                            comboBox.append($('<option/>').attr('itemId', itemId).html(paUserList[paId][itemId].name));
                        }
                        cell.html('').append(comboBox.clone());
                        cell.find('select:first').prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());
                        break;
                    case 'oslc_cm:priority':
                    case 'oslc_cm:severity':
                    case 'rtc_cm:com.ibm.team.apt.attribute.complexity':
                        var existImg = false,
                                enumName = wiAttributes.enumerations[wiAttributes.oslcName.indexOf(attrId)];
                        for (var counter = 0; counter < paEnumerationList[paId][enumName].literals.length; counter++) {
                            var itemId = paEnumerationList[paId][enumName].literals[counter]['id'],
                                    name = paEnumerationList[paId][enumName].literals[counter]['name'],
                                    htmlDisplay = ('' + name);
                            if (typeof paEnumerationList[paId][enumName].literals[counter]['iconUrl'] !== 'undefined') {
                                if (paEnumerationList[paId][enumName].literals[counter]['iconUrl'] !== null) {
                                    var iconUrl = paEnumerationList[paId][enumName].literals[counter]['iconUrl'];
                                    htmlDisplay = '<img class="icon-img" src="' + iconUrl + '">' + CharSpace + name;
                                    existImg = true;
                                }
                            }
                            comboBox.append($('<option/>').attr('itemId', itemId).html(htmlDisplay));
                        }
                        if (existImg) {
                            cell.html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                    .css('white-space', 'nowrap')
                                    .find('img:first').attr('src', paEnumerationList[paId][enumName].literals[0]['iconUrl']);
                            cell.append(comboBox.clone())
                                    .find('select:first')
                                    .change(function () {
                                        var rowIndex = $(this).closest('td').index(),
                                                attrOSLC = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (rowIndex + 1) + ')').attr('itemId'),
                                                enumerationIndex = wiAttributes.oslcName.indexOf(attrOSLC);
                                        $(this).parent()
                                                .find('img:first')
                                                .attr('src', paEnumerationList[paId][wiAttributes.enumerations[enumerationIndex]].literals[$(this).prop('selectedIndex')]['iconUrl']);
                                    });
                        } else {
                            cell.html('').append(comboBox.clone());
                        }
                        cell.find('select:first').prop('selectedIndex', cell.find('select:first option[itemId="' + data + '"]').index());
                        if (existImg) {
                            cell.find('img:first').attr('src', paEnumerationList[paId][enumName].literals[cell.find('select:first option[itemId="' + data + '"]').index()]['iconUrl']);
                        }
                        break;
                    case 'dc:creator':
                        cell.html('-');
                        break;
                    case 'rtc_cm:state':
                        cell.html('-');
                        break;
                    default:
                        cell.append(emptyComboBox.clone());
                }
                break;
            case 'Number':
                switch (attrId) {
                    case 'dc:identifier':
                        cell.html('NEW');
                        break;
                    case 'rtc_cm:estimate':

                        var dateComboBox = $('<select/>')
                                .append($('<option/>').html('s'))
                                .append($('<option/>').html('m'))
                                .append($('<option/>').html('h'))
                                .append($('<option/>').html('d'))
                                .append($('<option/>').html('w'));
                        cell.css('white-space', 'nowrap')
                                .append($('<input type="text" placeholder="0"/>').addClass('short'))
                                .append(dateComboBox.prop('selectedIndex', 2));
                        cell.find('input').on('input', function (e) {
                            if ($.isNumeric($(this).val()) || $(this).val() === '') {
                                $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
                            } else {
                                $(this).parent().css('border', colorBorderRed);
                            }
                        });
                        if (data !== '') {
                            var estimate = parseInt(data),
                                    dateList = [],
                                    normalDateList = [],
                                    number = 0,
                                    date = 'h';
                            dateList.push('w', 'd', 'h', 'm', 's');
                            normalDateList.push('s', 'm', 'h', 'd', 'w');
                            for (var counter = 0; counter < dateList.length; counter++) {
                                date = dateList[counter];
                                number = estimate.convertToDate(date);
                                if (number > 1 && parseInt(number) === number) {
                                    counter = dateList.length;
                                }
                            }
                            cell.find('input:first').val(number);
                            cell.find('select:first').prop('selectedIndex', normalDateList.indexOf(date));
                        }
                        break;
                    default:
                        cell.html('<input type="text" placeholder="Add number...">');
                }
                break;
            case 'Array':
                cell.html('Array Content');
                break;
            case 'null':
                cell.html('Null Content');
                break;
            case 'Boolean':
                cell.html('-');
                break;
            default:
                cell.html('-');
        }
        if (projectAreaList[paId].workitemAttributes[typeId].indexOf(wiAttributes.wiAttributes[wiAttributes.oslcName.indexOf(attrId)]) === -1) {
            cell.html('-'); //HHM1HC: remove the content because the workitem type excludes this attribute
        }
    }

    $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ') td:first')
            .html('<img class="button-img" src="' + imgDeleteButton + '">')
            .find('img').click(function () {
        var rowIndex = $(this).parent().parent().index();
        deleteRow(NEW_WI_TABLE_ID, rowIndex);
        deleteColumn(LINK_MATRIX_TABLE_ID, linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex]);
        deleteRow(LINK_MATRIX_TABLE_ID, linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex]);
        removeLinkMatrixMapping(NEW_WI_TABLE_ID, rowIndex);
    });

    $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (_rowIndex + 1) + ')')
            .html(htmlLinkMatrixDisplay).attr('paId', paId)
            .attr('typeId', typeId);
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ') td:first')
            .html(htmlLinkMatrixDisplay).attr('paId', paId)
            .attr('typeId', typeId);
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ') td:nth-child(' + (_rowIndex + 1) + ')').css("background-color", colorBackgroundGray);
    linkMatrixMapping[NEW_WI_TABLE_ID].push(_rowIndex);
    linkMatrixMapping[NEW_WI_TABLE_ID][_rowIndex] = _rowIndex;

    loadWorkitemsPresentNumber++;
    if (loadWorkitemsPresentNumber === loadWorkitemsTotalNumber) {
        loadLinkTypeTotalNumber = loadWorkitemsTotalNumber;
        loadLinkTypePresentNumber = 0;
        for (var counter = 0; counter < loadWorkitemsTotalNumber; counter++) {
            updateLinkTypeMatrix(NEW_WI_TABLE_ID, counter);
        }
    }
}
function saveTemplateToLocalFile() {
    var fileName = 'WorkitemCreationTemplate.json',
            fileContent = '{',
            myFile;
    fileContent += '\n"ATTRIBUTES":[\n';
    for (var counter = 1; counter < $('#' + NEW_WI_TABLE_ID + ' tr:first th').length; counter++) {
        fileContent += '{"attr":"' + $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (counter + 1) + ')').attr('itemId') + '"}';
        if (counter < ($('#' + NEW_WI_TABLE_ID + ' tr:first th').length - 1)) {
            fileContent += ',\n';
        }
    }
    fileContent += '\n],\n"WORKITEMS":[\n';
    for (var rowCounter = 1; rowCounter < $('#' + NEW_WI_TABLE_ID + ' tr').length; rowCounter++) {
        var row = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (rowCounter + 1) + ')');
        fileContent += '{';
        for (var colCounter = 1; colCounter < row.find('td').length; colCounter++) {
            var attrId = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (colCounter + 1) + ')').attr('itemId'),
                    cell = row.find('td:nth-child(' + (colCounter + 1) + ')');
            fileContent += '"' + attrId + '":"';
            switch (attrId) {
                case 'dc:type':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'rtc_cm:projectArea':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'dc:title':
                    fileContent += cell.find('input:first').val();
                    break;
                case 'rtc_cm:filedAgainst':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'rtc_cm:plannedFor':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'dc:description':
                    fileContent += cell.find('textarea:first').val();
                    break;
                case 'rtc_cm:ownedBy':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'dc:subject':
                    fileContent += cell.find('input:first').val();
                    break;
                case 'oslc_cm:priority':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'oslc_cm:severity':
                    var selectedOption = cell.find('select:first option:selected');
                    fileContent += selectedOption.attr('itemId');
                    break;
                case 'rtc_cm:com.ibm.team.apt.attribute.complexity':
                    if (cell.html() !== '-') {
                        var selectedOption = cell.find('select:first option:selected');
                        fileContent += selectedOption.attr('itemId');
                    }
                    break;
                case 'rtc_cm:estimate':
                    var selectedOption = cell.find('select:first option:selected'),
                            optionId = selectedOption.html(),
                            value = cell.find('input:first').val();
                    if (value !== '') {
                        if (!isNaN(parseInt(value))) {
                            fileContent += parseInt(value).convertToMiliseconds(optionId);
                        } else {
                            error('Wrong estimation');
                        }
                    }
                    break;
                case 'rtc_cm:due':
                    if (cell.find('input:first').prop('checked') === true) {
                        var year = cell.find('input:nth-child(2)').val(),
                                month = cell.find('input:nth-child(3)').val(),
                                day = cell.find('input:nth-child(4)').val(),
                                dateJSON = (new Date(year, (month - 1), day)).toJSON();
                        fileContent += dateJSON;
                    }
                    break;
                case 'rtc_cm:state':
                    break;
                case 'dc:creator':
                    break;
                case 'dc:created':
                    break;
                default:
                    //console.log('default case create wi');
            }
            if (colCounter < (row.find('td').length - 1)) {
                fileContent += '",';
            } else {
                fileContent += '"';
            }
        }
        if (rowCounter < ($('#' + NEW_WI_TABLE_ID + ' tr').length - 1)) {
            fileContent += '},\n';
        } else {
            fileContent += '}\n';
        }
    }

    fileContent += '],\n"LINKTYPES":[\n';
    for (var rowCounter = 1; rowCounter < $('#' + LINK_MATRIX_TABLE_ID + ' tr').length; rowCounter++) {
        var row = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowCounter + 1) + ')');
        fileContent += '{';
        for (var colCounter = 1; colCounter < row.find('td').length; colCounter++) {
            var cell = row.find('td:nth-child(' + (colCounter + 1) + ')'),
                    selectedOption = cell.find('select:first option:selected');
            fileContent += '"' + (colCounter - 1) + '":"' + selectedOption.attr('itemId') + '"';
            if (colCounter < (row.find('td').length - 1)) {
                fileContent += ',';
            }
        }
        fileContent += '}';
        if (rowCounter < ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length - 1)) {
            fileContent += ',\n';
        }
    }
    fileContent += '\n]\n}';
    myFile = new Blob([fileContent], {type: 'text/plain'});
    window.URL = window.URL || window.webkitURL;
    $('#Template-download-path').attr('href', window.URL.createObjectURL(myFile))
            .attr('download', fileName);
    document.getElementById('Template-download-path').click();
}
function getAllProjectAreaNames() {
    $.ajax({
        url: protocol + host + '/ccm/service/com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/allProjectAreas',
        headers: {
            'Accept': 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        success: function (data) {
            paNameList = [];
            var values = data['soapenv:Body'].response.returnValue.values;
            $.each(values, function (key, val) {
                paNameList.push(val.itemId);
                paNameList[val.itemId] = val.name;
                projectAreaList.push(val.itemId);
                projectAreaList[val.itemId] = new ProjectArea(val.itemId);
                projectAreaList[val.itemId].label = val.name;
                projectAreaList[val.itemId].getWorkitemTypeId();
            });
            console.log('#DEBUG: getAllProjectAreaNames:', paNameList);
            fetchAllCategoryInfo();
            fetchAllTimelinesInfo();
            fetchAllUserInfo();
            fetchAllTypesInfo();
            fetchAllEnumerationsInfo();
            fetchAllWorkflowsInfo();
            fetchAllProjectAreaConfigStateIdInfo();
        },
        error: function () {
            console.error('#ERROR: getAllProjectAreaNames: Error retriving project areas.');
        }
    });
}
function fetchAllProjectAreaConfigStateIdInfo() {
    paConfigStateIdList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchProjectAreaConfigStateIds(paNameList[i]);
    }
//HHM1HC: missing fetch user from teamareas
}
function fetchProjectAreaConfigStateIds(_paId) {
    var getUrl = protocol + host + '/ccm/service/com.ibm.team.rtc.common.internal.service.web.sprite.ISpriteImageService/js/processattachment?pa=' + _paId;
    var jqXHR = $.ajax({
        method: 'GET',
        url: getUrl,
        paId: _paId,
        headers: {
            'Accept': 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        success: function (data) {
            paConfigStateIdList.push(this.paId);
            paConfigStateIdList[this.paId] = (/c=(.+)($|&|")/.exec(data[this.paId].imagePath))[1];
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchProjectAreaStateIds: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchProjectAreaStateIds: error retrieving enumerates for PA ' + _paId + '.');
        }
    });
}
function fetchAllWorkflowsInfo() {
    paWorkflowsList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchWorkflows(paNameList[i]);
    }
//HHM1HC: missing fetch user from teamareas
}
function fetchWorkflows(_paId) {
    var getUrl = protocol + host + '/ccm/service/com.ibm.team.workitem.service.process.internal.rest.IWorkItemConfigRestService/workflows?projectAreaItemId=' + _paId;
    $.ajax({
        url: getUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept': 'text/json'
        },
        success: function (data) {
            var workflowDefinitions = data['soapenv:Body']['response']['returnValue']['value']['workflowDefinitions'];
            paWorkflowsList.push(_paId);
            paWorkflowsList[_paId] = [];
            for (var counter = 0; counter < workflowDefinitions.length; counter++) {
                var workflowId = workflowDefinitions[counter]['id'];
                paWorkflowsList[_paId].push(workflowId);
                paWorkflowsList[_paId][workflowId] = workflowDefinitions[counter]['workflows'][0];
            }
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchWorkflows: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchWorkflows: error retrieving enumerates for PA ' + _paId + '.');
        }
    });
}
function fetchAllEnumerationsInfo() {
    paEnumeratesList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchEnumerations(paNameList[i]);
    }
//HHM1HC: missing fetch user from teamareas
}
function fetchEnumerations(_paId) {
    var getEnumerationsUrl = protocol + host + '/ccm/service/com.ibm.team.workitem.service.process.internal.rest.IWorkItemConfigRestService/attributeTypes?projectAreaItemId=' + _paId;
    $.ajax({
        url: getEnumerationsUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept': 'text/json'
        },
        success: function (data) {
            var enumerations = data['soapenv:Body']['response']['returnValue']['value']['enumerationTypes'];
            paEnumerationList.push(_paId);
            paEnumerationList[_paId] = [];
            for (var counter = 0; counter < enumerations.length; counter++) {
                var enumerationId = enumerations[counter]['id'];
                paEnumerationList[_paId].push(enumerationId);
                paEnumerationList[_paId][enumerationId] = [];
                paEnumerationList[_paId][enumerationId].displayName = enumerations[counter]['displayName'];
                paEnumerationList[_paId][enumerationId]._eQualifiedClassName = enumerations[counter]['_eQualifiedClassName'];
                paEnumerationList[_paId][enumerationId].literals = enumerations[counter]['literals'];
            }
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchEnumerates: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchEnumerates: error retrieving enumerates for PA ' + _paId + '.');
        }
    });
}
function fetchAllTypesInfo() {
    paTypeList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchTypes(paNameList[i]);
    }
}
function fetchTypes(_paId) {
    var getTypesUrl = protocol + host + '/ccm/service/com.ibm.team.workitem.service.process.internal.rest.IWorkItemConfigRestService/workItemTypes?projectAreaItemId=' + _paId;
    //console.log('#DEBUG get types url', getTypesUrl);
    $.ajax({
        url: getTypesUrl,
        headers: {
            'Accept': 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        success: function (data) {
            var types = data['soapenv:Body']['response']['returnValue']['value']['types'];
            paTypeList.push(_paId);
            paTypeList[_paId] = [];
            for (var counter = 0; counter < types.length; counter++) {
                var typeId = types[counter]['id'];
                paTypeList[_paId].push(typeId);
                paTypeList[_paId][typeId] = [];
                paTypeList[_paId][typeId].identifier = types[counter]['id'];
                paTypeList[_paId][typeId].title = types[counter]['name'];
                paTypeList[_paId][typeId].iconUrl = types[counter]['iconUrl'];
                paTypeList[_paId][typeId].category = types[counter]['category'];
                paTypeList[_paId][typeId].workflowId = types[counter]['workflowId'];
            }
            //console.log('#DEBUG: fetchTypes: PA:', paNameList[_paId], 'paTypeList list:', paTypeList[_paId]);
            fetchAllLinkTypeInfo(_paId);
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchTypes: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchTypes: error retrieving categories for PA ' + _paId + '.');
        }
    });
}
function fetchAllLinkTypeInfo(_paId) {
    paLinkTypeList.push(_paId);
    paLinkTypeList[_paId] = [];
    for (var counterLv2 = 0; counterLv2 < paTypeList[_paId].length; counterLv2++) {
        fetchLinkTypes(_paId, paTypeList[_paId][counterLv2]);
    }
}
function fetchLinkTypes(_paId, _type) {
    var getLinkTypesUrl = protocol + host + '/ccm/oslc/context/' + _paId + '/shapes/workitems/' + _type;
    //console.log('#DEBUG get link types url', getLinkTypesUrl);
    $.ajax({
        url: getLinkTypesUrl,
        headers: {
            'Accept': 'application/json',
            'OSLC-Core-Version': '2.0'
        },
        success: function (data) {
            var linktypes = data['oslc:property'];
            paLinkTypeList[_paId].push(_type);
            paLinkTypeList[_paId][_type] = [];
            var linktypeList = [];
            for (var counter = 0; counter < linktypes.length; counter++) {
                var linktypeId = REGEX_LAST_URI_PATH.exec(linktypes[counter]['rdf:about'])[0];
                if (true
                        && (linktypeId.indexOf(linktypeEnable) !== -1)
                        && (linkTypeEnableList.indexOf(linktypeId) !== -1)
                        /*&&(linktypeId.indexOf('cm') != -1)*/
                        ) {
                    linktypeList.push(linktypeId);
                    linktypeList[linktypeId] = [];
                    linktypeList[linktypeId].oslcname = linktypes[counter]['oslc:name'];
                    linktypeList[linktypeId].title = linktypes[counter]['dcterms:title'];
                    linktypeList[linktypeId].readOnly = linktypes[counter]['oslc:readOnly'];
                    linktypeList[linktypeId].defaultValue = linktypes[counter]['oslc:defaultValue'];
                    //if (_type.indexOf('epic') != -1) {console.log(linktypeList[linktypeId].oslcname,';', linktypeList[linktypeId].title,';', linktypeList[linktypeId].readOnly);}
                }
            }

            for (var counter = 0; counter < linkTypeEnableList.length; counter++) {
                if (linktypeList.indexOf(linkTypeEnableList[counter]) !== -1) {
                    var linktypeId = linkTypeEnableList[counter];
                    paLinkTypeList[_paId][_type].push(linktypeId);
                    paLinkTypeList[_paId][_type][linktypeId] = linktypeList[linktypeId];
                }
            }

            //console.log('#DEBUG: fetchLinkTypes: PA:', paNameList[_paId], 'paLinkTypeList list:', paLinkTypeList[_paId][_type]);
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchLinkTypes: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchLinkTypes: error retrieving categories for PA ' + _paId + '.');
        }
    });
}
function fetchAllUserInfo() {
    paUserList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchUsers(paNameList[i]);
    }
//HHM1HC: missing fetch user from teamareas
}
function fetchUsers(_paId) {
    var getUsersUrl = protocol + host + '/ccm/service/com.ibm.team.process.internal.service.web.IProcessWebUIService/projectAreaByUUIDWithLimitedMembers?processAreaItemId=' + _paId + '&maxMembers=100000';
    //console.log('#DEBUG get users url', getUsersUrl);
    $.ajax({
        url: getUsersUrl,
        headers: {
            'Accept': 'text/json'
        },
        success: function (data) {
            var members = data['soapenv:Body']['response']['returnValue']['value']['members'];
            paUserList.push(_paId);
            paUserList[_paId] = [];
            for (var counter = 0; counter < members.length; counter++) {
                var userId = members[counter]['itemId'];
                paUserList[_paId].push(userId);
                paUserList[_paId][userId] = [];
                paUserList[_paId][userId].userId = members[counter]['userId'];
                paUserList[_paId][userId].name = members[counter]['name'];
                paUserList[_paId][userId].archived = members[counter]['archived'];
                paUserList[_paId][userId].emailAddress = members[counter]['emailAddress'];
                paUserList[_paId][userId].processRoles = members[counter]['processRoles'];
                if (typeof paUserByIdList[members[counter]['userId']] === 'undefined') {
                    paUserByIdList.push(members[counter]['userId']);
                    paUserByIdList[members[counter]['userId']] = [];
                    paUserByIdList[members[counter]['userId']].userId = members[counter]['itemId'];
                    paUserByIdList[members[counter]['userId']].name = members[counter]['name'];
                    paUserByIdList[members[counter]['userId']].archived = members[counter]['archived'];
                    paUserByIdList[members[counter]['userId']].emailAddress = members[counter]['emailAddress'];
                    paUserByIdList[members[counter]['userId']].processRoles = members[counter]['processRoles'];
                }
            }
            //console.log('#DEBUG: fetchUsers: PA:', paNameList[_paId], 'paUserList list:', paUserList[_paId], 'UserById list:',paUserByIdList);
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchUsers: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchUsers: error retrieving categories for PA ' + _paId + '.');
        }
    });
}
function fetchAllTimelinesInfo() {
    paTimelineList = [];
    paIterationList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchTimelines(paNameList[i]);
    }
}
function fetchTimelines(_paId) {
    $.ajax({
        url: protocol + host + '/ccm/service/com.ibm.team.process.internal.common.service.IProcessRestService/projectDevelopmentLines?uuid=' + _paId,
        _paId: _paId,
        headers: {
            'Accept': 'text/json'
        },
        success: function (data) {
            var values = data['soapenv:Body']['response']['returnValue']['values'];
            paTimelineList.push(this._paId);
            paTimelineList[this._paId] = [];
            paIterationList.push(this._paId);
            paIterationList[this._paId] = [];
            for (var counter = 0; counter < values.length; counter++) {
                var timelineId = values[counter]['itemId'];
                paTimelineList[this._paId].push(timelineId);
                fetchIterations(this._paId, timelineId);
                paTimelineList[this._paId][timelineId] = [];
                paTimelineList[this._paId][timelineId].id = values[counter]['id'];
                paTimelineList[this._paId][timelineId].label = values[counter]['label'];
                paTimelineList[this._paId][timelineId].archive = values[counter]['archive'];
            }
            //console.log('#DEBUG: fetchTimelines: PA:', paNameList[_paId], 'Timelines list:', paTimelineList[_paId]);
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchTimelines: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchTimelines: error retrieving categories for PA ' + this._paId + '.');
        }
    });
}
function fetchIterations(_paId, _timelineId) {
    var getIterationsUrl = protocol + host + '/ccm/service/com.ibm.team.process.internal.service.web.IProcessWebUIService/iterations?uuid=' + _timelineId + '&includeArchived=true';
    $.ajax({
        url: getIterationsUrl,
        _paId: _paId,
        _timelineId: _timelineId,
        headers: {
            'Accept': 'text/json'
        },
        success: function (data) {
            var results = data['soapenv:Body']['response']['returnValue']['values'];
            for (var counter = 0; counter < results.length; counter++) {
                var iterationId = results[counter]['itemId'];
                paIterationList[this._paId].push(iterationId);
                paIterationList[this._paId][iterationId] = [];
                paIterationList[this._paId][iterationId].paId = this._paId;
                paIterationList[this._paId][iterationId].parentItemId = results[counter]['parentItemId'];
                paIterationList[this._paId][iterationId].label = results[counter]['label'];
                paIterationList[this._paId][iterationId].id = results[counter]['id'];
                paIterationList[this._paId][iterationId].hierachy = results[counter]['id'];

                if (typeof results[counter]['iterations'] !== 'undefined') {
                    for (var counterLv2 = 0; counterLv2 < results[counter]['iterations'].length; counterLv2++) {
                        getIteration(this._paId, results[counter]['iterations'][counterLv2], paIterationList[this._paId][iterationId].hierachy);
                    }
                }
            }
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchIterations: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchIterations: error retrieving categories for PA ' + this._paId + '.');
        }
    });
}
function getIteration(_paId, _iterationsData, _parentHierachy) {
    var iterationId = _iterationsData['itemId'];
    paIterationList[_paId].push(iterationId);
    paIterationList[_paId][iterationId] = [];
    paIterationList[_paId][iterationId].paId = _paId;
    paIterationList[_paId][iterationId].parentItemId = _iterationsData['parentItemId'];
    paIterationList[_paId][iterationId].label = _iterationsData['label'];
    paIterationList[_paId][iterationId].id = _iterationsData['id'];
    paIterationList[_paId][iterationId].hierachy = _parentHierachy + '/' + _iterationsData['id'];

    if (typeof _iterationsData['iterations'] !== 'undefined') {
        for (var counter = 0; counter < _iterationsData['iterations'].length; counter++) {
            getIteration(_paId, _iterationsData['iterations'][counter], paIterationList[_paId][iterationId].hierachy);
        }
    }
}
function fetchAllCategoryInfo() {
    paCategoryList = [];
    for (var i = 0; i < paNameList.length; i++) {
        fetchCategories(paNameList[i]);
    }
}
function fetchCategories(_paId) {
    $.ajax({
        url: protocol + host + '/ccm/oslc/categories.xml?oslc_cm.query=rtc_cm:projectArea="' + _paId + '" and rtc_cm:archived="false"',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        success: function (data) {
            var catList = [];
            var $xml = $(data);
            $xml.find('rtc_cm\\:Category').each(function (key, val) {
                var id = REGEX_LAST_URI_PATH.exec($(val).attr('rdf:resource'))[0];
                var title = $(val).find('dc\\:title').text();
                catList.push(id);
                catList[id] = title;
                paCategoryList.push(_paId);
                paCategoryList[_paId] = catList;
            });

        },
        error: function (jqXHR, textStatus) {

            console.error('#ERROR: getAllCategories: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: getAllCategories: error retrieving categories for PA ' + _paId + '.');
        }
    });
}
function createUpdateWorkitems(_rowIndex) {
    //newWorkitemPresentCounter
    //newWorkitemTotalCounter
    var newWiIdIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="dc:identifier"]').index(),
            row = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ')');
    if (row.find('td:nth-child(' + (newWiIdIndex + 1) + ')').html() !== 'NEW') {
        createUpdateWorkitems(_rowIndex + 1);
        return;
    } else {
        var _url = protocol + host + '/ccm/oslc/contexts/',
                _textChunk = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:acp="http://jazz.net/ns/acp#" xmlns:oslc="http://open-services.net/ns/core#" xmlns:oslc_cmx="http://open-services.net/ns/cm-x#" xmlns:process="http://jazz.net/ns/process#" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:oslc_cm="http://open-services.net/ns/cm#" xmlns:acc="http://open-services.net/ns/core/acc#" xmlns:oslc_pl="http://open-services.net/ns/pl#" xmlns:rtc_cm="http://jazz.net/xmlns/prod/jazz/rtc/cm/1.0/" xmlns:rtc_ext="http://jazz.net/xmlns/prod/jazz/rtc/ext/1.0/"> <oslc_cm:ChangeRequest>',
                newRowIndex = row.index();
        var typeId = 'NA',
                paId = 'NA',
                faId = 'NA',
                faName = 'Unassigned',
                title = 'NA',
                pfId = 'NA',
                ownerId = 'NA';
        for (var counter = 1; counter < row.find('td').length; counter++) {
            var attrId = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (counter + 1) + ')').attr('itemId'),
                    cell = row.find('td:nth-child(' + (counter + 1) + ')');
            //console.log(rowIndex, columnIndex, attrId, row.html());
            switch (attrId) {
                case 'dc:type':
                    var selectedOption = cell.find('select:first option:selected');
                    typeId = selectedOption.attr('itemId');
                    break;
                case 'rtc_cm:projectArea':
                    var selectedOption = cell.find('select:first option:selected');
                    paId = selectedOption.attr('itemId');
                    break;
                case 'dc:title':
                    title = cell.find('input:first').val();
                    _textChunk += '<dcterms:title>' + title + '</dcterms:title>';
                    break;
                case 'rtc_cm:filedAgainst':
                    var selectedOption = cell.find('select:first option:selected');
                    faId = selectedOption.attr('itemId');
                    faName = selectedOption.html();
                    _textChunk += '<rtc_cm:filedAgainst rdf:resource="' + protocol + host + '/ccm/resource/itemOid/com.ibm.team.workitem.Category/' + faId + '"/>';
                    break;
                case 'rtc_cm:plannedFor':
                    var selectedOption = cell.find('select:first option:selected');
                    pfId = selectedOption.attr('itemId');
                    if (pfId !== 'NA') {
                        _textChunk += '<rtc_cm:plannedFor rdf:resource="' + protocol + host + '/ccm/oslc/iterations/' + pfId + '"/>';
                    }
                    break;
                case 'dc:description':
                    _textChunk += '<dcterms:description>' + cell.find('textarea:first').val() + '</dcterms:description>';
                    break;
                case 'rtc_cm:ownedBy':
                    var selectedOption = cell.find('select:first option:selected');
                    ownerId = selectedOption.attr('itemId');
                    break;
                case 'dc:subject':
                    _textChunk += '<dcterms:subject>' + cell.find('input:first').val() + '</dcterms:subject>';
                    break;
                case 'oslc_cm:priority':
                    var selectedOption = cell.find('select:first option:selected'),
                            optionId = selectedOption.attr('itemId');
                    _textChunk += '<oslc_cmx:priority rdf:resource="' + protocol + host + '/ccm/oslc/enumerations/' + paId + '/priority/' + optionId + '"/>';
                    break;
                case 'oslc_cm:severity':
                    var selectedOption = cell.find('select:first option:selected'),
                            optionId = selectedOption.attr('itemId');
                    _textChunk += '<oslc_cmx:severity rdf:resource="' + protocol + host + '/ccm/oslc/enumerations/' + paId + '/severity/' + optionId + '"/>';
                    break;
                case 'rtc_cm:com.ibm.team.apt.attribute.complexity':
                    if (cell.html() !== '-') {
                        var selectedOption = cell.find('select:first option:selected'),
                                optionId = selectedOption.attr('itemId');
                        _textChunk += '<rtc_ext:com.ibm.team.apt.attribute.complexity rdf:resource="' + protocol + host + '/ccm/oslc/enumerations/' + paId + '/complexity/' + optionId + '"/>';
                    }
                    break;
                case 'rtc_cm:estimate':
                    var selectedOption = cell.find('select:first option:selected'),
                            optionId = selectedOption.html(),
                            value = cell.find('input:first').val();
                    if (value !== '') {
                        if (!isNaN(parseInt(value))) {
                            _textChunk += '<rtc_cm:estimate>' + parseInt(value).convertToMiliseconds(optionId) + '</rtc_cm:estimate>';
                        } else {
                            cell.css('border', colorBorderRed);
                        }
                    }
                    break;
                case 'rtc_cm:due':
                    if (cell.find('input:first').prop('checked')) {
                        var year = cell.find('input:nth-child(2)').val(),
                                month = cell.find('input:nth-child(3)').val(),
                                day = cell.find('input:nth-child(4)').val(),
                                dateJSON = (new Date(year, month, day)).toJSON();
                        _textChunk += '<rtc_cm:due>' + dateJSON + '</rtc_cm:due>';
                    }
                    break;
                case 'rtc_cm:state':
                    break;
                case 'dc:creator':
                    break;
                case 'dc:created':
                    break;
                default:
                    //console.log('default case create wi');
            }
        }

        if (paId === 'NA' || faId === 'NA' || title === '' || faName === 'Unassigned') {
            error("Can not create workitem");
            var paIdIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="rtc_cm:projectArea"]').index(),
                    faIdIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="rtc_cm:filedAgainst"]').index(),
                    titleIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="dc:title"]').index();
            if (paId === 'NA') {
                row.find('td:nth-child(' + (paIdIndex + 1) + ')').css('border', colorBorderRed);
            }
            if (faId === 'NA' || faName === 'Unassigned') {
                row.find('td:nth-child(' + (faIdIndex + 1) + ')').css('border', colorBorderRed);
            }
            if (title === '') {
                row.find('td:nth-child(' + (titleIndex + 1) + ')').css('border', colorBorderRed);
            }
            createUpdateWorkitems(_rowIndex + 1);
        } else {
            _url += paId + '/workitems/' + typeId;
            _textChunk += '<dcterms:type>' + paTypeList[paId][typeId].title + '</dcterms:type>';
            _textChunk += '<rtc_cm:type rdf:resource="' + protocol + host + '/ccm/oslc/types/' + paId + '/' + typeId + '"/>';
            if (ownerId !== 'NA') {
                _textChunk += '<dcterms:contributor rdf:resource="' + protocol + host + '/jts/users/' + paUserList[paId][ownerId].userId + '"/>';
            }
            _textChunk += '</oslc_cm:ChangeRequest></rdf:RDF>';
            presentWorkitemRowIndex = _rowIndex;
            createWorkitemWithUrlAndData(_url, _textChunk, newRowIndex);
        }
    }
}
function createWorkitemWithUrlAndData(_url, _data, _rowIndex) {
    $('#httpUrl').text(_url);
    $('#httpBody').text(_data);
    $.ajax({
        method: 'POST',
        url: _url,
        headers: {
            'OSLC-Core-Version': '2.0',
            'Accept': 'application/rdf+xml',
            'Content-Type': 'application/rdf+xml'
        },
        rowIndex: _rowIndex,
        data: _data,
        success: function (data) {
            var wiId = $(data).find('dcterms\\:identifier').html(),
                    getUrl = protocol + host + '/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/' + wiId,
                    projectIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="rtc_cm:projectArea"]').index(),
                    project = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:nth-child(' + (projectIndex + 1) + ') select:first option:selected').attr('itemId'),
                    typeIndex = $('#' + NEW_WI_TABLE_ID + ' th[itemId="dc:type"]').index(),
                    type = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:nth-child(' + (typeIndex + 1) + ') select:first option:selected').attr('itemId');
            fetchExistingWorkItemInfoById(wiId, this.rowIndex, NEW_WI_TABLE_ID, true);
        },
        error: function (jqXHR, textStatus) {
            console.log('#ERROR: createWorkitemWithUrlAndData: ' + textStatus + '  ' + jqXHR.responseText);
        }
    });
}
/*
 * Update/create all link types with link type matrix table
 * Used after creation of new workitems or only create link types with the existing workitems
 * 
 * @returns {undefined} */
function updateLinkTypeMapping() {
    /*
     * Sort the linktype updations for easy handling
     */
    var linkTypeMatrixTable = $('#' + LINK_MATRIX_TABLE_ID);
    for (var rowCounter = 1; rowCounter < linkTypeMatrixTable.find('tr').length; rowCounter++) {
        var row = linkTypeMatrixTable.find('tr:nth-child(' + (rowCounter + 1) + ')');
        for (var colCounter = 1; colCounter < row.find('td').length; colCounter++) {
            var cell = row.find('td:nth-child(' + (colCounter + 1) + ')'),
                    coreslinktypeId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (colCounter + 1) + ') td:nth-child(' + (rowCounter + 1) + ') select:first option:selected').attr('itemId');
            if (typeof cell.attr("update") !== "undefined") {
                if (cell.attr("update") === true.toString()) {
                    if (listTypeEnableCorespondList.indexOf(coreslinktypeId) === -1) {
//cell.attr("update", false);
                    } else {
                        $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (colCounter + 1) + ') td:nth-child(' + (rowCounter + 1) + ')').attr('update', false);
                    }
                }
            }
        }
    }
    paLinkTypeUpdateMappingList = [];
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:not(:first)').each(function () {

        var wiId = $(this).find('td:first').attr('wiId'),
                getLinkType = [],
                _rowIndex = $(this).index(),
                bodydata = 'itemId=' + workitemList['#' + wiId].itemId + '&type=' + workitemList['#' + wiId].type + '&stateId=' + workitemList['#' + wiId].stateId;

        paLinkTypeUpdateMappingList.push('#' + wiId);
        paLinkTypeUpdateMappingList['#' + wiId] = [];
        for (var colCounter = 1; colCounter < $(this).find('td').length; colCounter++) {
            var cell = $(this).find('td:nth-child(' + (colCounter + 1) + ')'),
                    linkedWiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (colCounter + 1) + ')').attr('wiId');
            if (typeof cell.attr("update") !== "undefined") {
                if (cell.attr("update") === true.toString()) {
                    var _linktype = cell.find('select:first option:selected').attr('itemId');
                    paLinkTypeUpdateMappingList['#' + wiId].push('#' + linkedWiId);
                    paLinkTypeUpdateMappingList['#' + wiId]['#' + linkedWiId] = _linktype;
                    if (_linktype !== 'NA' && getLinkType.indexOf(linkTypeEnableHeaderList[linkTypeEnableList.indexOf(_linktype)]) === -1) {
                        getLinkType.push(linkTypeEnableHeaderList[linkTypeEnableList.indexOf(_linktype)]);
                    }
                    if (typeof paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId] !== 'undefined') {
                        if (getLinkType.indexOf(linkTypeEnableHeaderList[linkTypeEnableList.indexOf(paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId])]) === -1) {
                            getLinkType.push(linkTypeEnableHeaderList[linkTypeEnableList.indexOf(paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId])]);
                        }
                    }
                }
            }
        }

        if (getLinkType.length !== 0) {
            var newLinkType = paLinkTypeUpdateMappingList,
                    oldLinkType = paLinkTypeMatrixList;
            /*Remove the old link type and add the new link type*/
            for (var counter = 0; counter < newLinkType['#' + wiId].length; counter++) {
                var linkedId = newLinkType['#' + wiId][counter].replace('#', '');
                if (typeof oldLinkType['#' + wiId]['#' + linkedId] !== 'undefined') {
                    var jsonString = '{"cmd":"removeLink",';
                    jsonString += '"type":"' + oldLinkType['#' + wiId]['#' + linkedId].removeLastEleWithDelimiter('.') + '",';
                    jsonString += '"end":"source",';
                    jsonString += '"name":"' + linkTypeNameList[linkTypeEnableList.indexOf(oldLinkType['#' + wiId]['#' + linkedId])] + '",';
                    jsonString += '"itemId":"' + workitemList['#' + linkedId].itemId + '"}';
                    bodydata += '&updateLinks=' + encodeURI(jsonString);
                    if (newLinkType['#' + wiId]['#' + linkedId] !== 'NA') {
                        var jsonString = '{"cmd":"addLink",';
                        jsonString += '"type":"' + newLinkType['#' + wiId]['#' + linkedId].removeLastEleWithDelimiter('.') + '",';
                        jsonString += '"end":"source",';
                        jsonString += '"name":"' + linkTypeNameList[linkTypeEnableList.indexOf(newLinkType['#' + wiId]['#' + linkedId])] + '",';
                        jsonString += '"comment":"' + linkedId + ': ' + workitemList['#' + linkedId].summary + '",';
                        jsonString += '"itemId":"' + workitemList['#' + linkedId].itemId + '"}';
                        bodydata += '&updateLinks=' + encodeURI(jsonString);
                    }
                } else {
                    if (newLinkType['#' + wiId]['#' + linkedId] !== 'NA') {
                        var jsonString = '{"cmd":"addLink",';
                        jsonString += '"type":"' + newLinkType['#' + wiId]['#' + linkedId].removeLastEleWithDelimiter('.') + '",';
                        jsonString += '"end":"source",';
                        jsonString += '"name":"' + linkTypeNameList[linkTypeEnableList.indexOf(newLinkType['#' + wiId]['#' + linkedId])] + '",';
                        jsonString += '"comment":"' + linkedId + ': ' + workitemList['#' + linkedId].summary + '",';
                        jsonString += '"itemId":"' + workitemList['#' + linkedId].itemId + '"}';
                        bodydata += '&updateLinks=' + encodeURI(jsonString);
                    }
                }
            }

            bodydata += '&additionalSaveParameters=com.ibm.team.workitem.common.internal.updateExtendedRichText&additionalSaveParameters=com.ibm.team.workitem.common.internal.updateBacklinks&sanitizeHTML=true&projectAreaItemId=' + workitemList['#' + wiId].paId + '&projectAreaConfigurationStateId=' + projectAreaList[workitemList['#' + wiId].paId].getConfigurationStateId();

            var getHtmlRequest = $.ajax({
                method: 'POST',
                url: protocol + host + '/ccm/service/com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItem2',
                headers: {
                    'Accept': 'text/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                data: bodydata,
                rowIndex: _rowIndex,
                wiId: wiId,
                success: function (data) {
                    console.log('Done');
                    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:not(:first-child)').each(function () {
                        if ($(this).attr('update') === 'true') {
                            var columnIndex = $(this).index(),
                                    rowIndex = $(this).parent().index();
                            $(this).css('border', colorBorderNone)
                                    .css("border-bottom", colorBorderBottmNone)
                                    .attr('update', false);
                            $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (columnIndex + 1) + ') td:nth-child(' + (rowIndex + 1) + ')')
                                    .css('border', colorBorderNone)
                                    .css("border-bottom", colorBorderBottmNone)
                                    .attr('update', false);
                        }
                    });
                },
                error: function (jqXHR, textStatus) {
                    error('updateLinkTypeMapping: The workitem having Id "' + wiId + '" is invalid.');
                    console.error('updateLinkTypeMapping: ' + textStatus + '  ' + getHtmlRequest.responseText);
                    console.error('updateLinkTypeMapping: error retrieving info for workitem ' + wiId + '.');
                }
            });
        }
    });
}
function postLinkType(_url, _bodydata, _etag, _rowIndex) {
    //HHM1HC: not used
    $.ajax({
        method: 'PUT',
        url: _url,
        headers: {
            'OSLC-Core-Version': '2.0',
            'Accept': 'application/rdf+xml',
            'If-Match': _etag,
            'Content-Type': 'application/rdf+xml',
            'Name': 'Value'
        },
        data: _bodydata,
        rowIndex: _rowIndex,
        success: function (data) {
            console.log('Done');
            $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:not(:first-child)').each(function () {
                if ($(this).attr('update') === 'true') {
                    var columnIndex = $(this).index(),
                            rowIndex = $(this).parent().index();
                    $(this).css('border', colorBorderNone)
                            .css("border-bottom", colorBorderBottmNone)
                            .attr('update', false);
                    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (columnIndex + 1) + ') td:nth-child(' + (rowIndex + 1) + ')')
                            .css('border', colorBorderNone)
                            .css("border-bottom", colorBorderBottmNone)
                            .attr('update', false);
                }
            });
            //var wiId = $(data).find('dcterms\\:identifier').html();
            //fetchExistingWorkItemInfoById(wiId, this._rowIndex, NEW_WI_TABLE_ID, false);
        },
        error: function (jqXHR, textStatus) {
            console.log('#ERROR: create Link Type: ' + textStatus + '  ' + jqXHR.responseText);
        }
    });
}
function fetchExistingWorkItemInfoById(_wiId, _rowIndex, _tableId, _updateLinkTypeStatus) {
    var getUrl = protocol + host + '/ccm/resource/itemName/com.ibm.team.workitem.WorkItem/' + _wiId;
    $.ajax({
        url: getUrl,
        _wiId: _wiId,
        _rowIndex: _rowIndex,
        _tableId: _tableId,
        headers: {
            'Accept': 'text/json'
                    /*'Accept': 'application/json',
                     'OSLC-Core-Version': '2.0'*/
        },
        success: function (data) {
            var type = REGEX_LAST_URI_PATH.exec(data['dc:type']['rdf:resource'])[0],
                    project = REGEX_LAST_URI_PATH.exec(data['rtc_cm:projectArea']['rdf:resource'])[0];
            //HHM1HC: need to replace the current fetching by this fetching
            fetchWorkitemByWorkitemDTO2(this._wiId, project);
            if (this._tableId === EXISTING_WI_TABLE_ID) {
                appendRow(EXISTING_WI_TABLE_ID);
                appendRow(LINK_MATRIX_TABLE_ID);
                appendColumn(LINK_MATRIX_TABLE_ID);
            }
            for (var counter = 1; counter < $('#' + this._tableId + ' tr:first th').length; counter++) {
                var columnIndex = counter,
                        attrId = $('#' + this._tableId + ' tr:first th:nth-child(' + (columnIndex + 1) + ')').attr('itemId'),
                        htmlDisplay = 'NA';
                switch (wiAttributes.method[wiAttributes.oslcName.indexOf(attrId)]) {
                    case 'String':
                        if (data[attrId] === null) {
                            htmlDisplay = '-';
                        } else {
                            switch (attrId) {
                                case 'rtc_cm:due':
                                    htmlDisplay = data[attrId].shortDate();
                                    break;
                                case 'dc:created':
                                    htmlDisplay = data[attrId].shortDate();
                                    break;
                                default:
                                    htmlDisplay = data[attrId];
                            }
                        }
                        break;
                    case 'Link':
                        var innerContent = '', innerLink = 'NA';
                        switch (attrId) {
                            case 'dc:type':
                                innerContent = '<img src="' + paTypeList[project][type].iconUrl + '"/>&nbsp;' + paTypeList[project][type].title;
                                break;
                            case 'rtc_cm:projectArea':
                                innerContent = paNameList[project];
                                innerLink = encodeURI(protocol + host + '/ccm/web/projects/' + paNameList[REGEX_LAST_URI_PATH.exec(data[attrId]['rdf:resource'])[0]]);
                                break;
                            case 'rtc_cm:filedAgainst':
                                innerContent = 'NA';
                                if (data[attrId] !== null) {
                                    var filedAgainst = REGEX_LAST_URI_PATH.exec(data[attrId]['rdf:resource'])[0];
                                    innerContent = paCategoryList[project][filedAgainst];
                                }
                                break;
                            case 'rtc_cm:plannedFor':
                                innerContent = 'Unassigned';
                                if (data[attrId] !== null) {
                                    var plannedFor = REGEX_LAST_URI_PATH.exec(data[attrId]['rdf:resource'])[0];
                                    innerContent = paIterationList[project][plannedFor].id;
                                }
                                break;
                            case 'rtc_cm:ownedBy':
                                var owner = REGEX_LAST_URI_PATH.exec(data[attrId]['rdf:resource'])[0];
                                innerContent = 'Unassigned';
                                if (owner !== 'unassigned') {
                                    innerContent = paUserByIdList[owner].name;
                                }
                                break;
                            case 'oslc_cm:priority':
                                $.ajax({
                                    url: data[attrId]['rdf:resource'],
                                    headers: {
                                        'Accept': 'text/json'
                                    },
                                    columnIndex: columnIndex,
                                    rowIndex: _rowIndex,
                                    tableId: _tableId,
                                    success: function (miniData) {
                                        $('#' + this.tableId + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:nth-child(' + (this.columnIndex + 1) + ')')
                                                .html('<img src="' + miniData['rtc_cm:iconUrl'] + '"/>' + CharSpace + miniData['dc:title']);
                                    },
                                    error: function () {
                                        //HHM1HC: miss error
                                    }
                                });
                                break;
                            case 'rtc_cm:state':
                            case 'oslc_cm:severity':
                            case 'rtc_cm:com.ibm.team.apt.attribute.complexity':
                                if (typeof data[attrId] !== 'undefined') {
                                    $.ajax({
                                        url: data[attrId]['rdf:resource'],
                                        headers: {
                                            'Accept': 'text/json'
                                        },
                                        columnIndex: columnIndex,
                                        rowIndex: _rowIndex,
                                        tableId: _tableId,
                                        success: function (miniData) {
                                            $('#' + this.tableId + ' tr:nth-child(' + (this.rowIndex + 1) + ') td:nth-child(' + (this.columnIndex + 1) + ')')
                                                    .html(miniData['dc:title']);
                                        },
                                        error: function () {
                                            //HHM1HC: miss error
                                        }
                                    });
                                } else {
                                    innerContent = '-';
                                }
                                break;
                            default:
                                innerContent = REGEX_LAST_URI_PATH.exec(data[attrId]['rdf:resource'])[0];
                                innerLink = data[attrId]['rdf:resource'];
                                console.log('There exists problem');
                        }
                        if (typeof data[attrId] !== 'undefined' && innerLink !== 'NA') {
                            htmlDisplay = '<a href="' + innerLink + '">' + innerContent + '</a>';
                        } else {
                            htmlDisplay = innerContent;
                        }
                        break;
                    case 'Number':
                        if (data[attrId] === null) {
                            htmlDisplay = '-';
                        } else {
                            switch (attrId) {
                                case 'dc:identifier':
                                    htmlDisplay = '<a href="' + getUrl + '">' + this._wiId + '<a>';
                                    break;
                                case 'rtc_cm:estimate':
                                    htmlDisplay = data[attrId].convertFromMilisecondToDate().number + ' ' + data[attrId].convertFromMilisecondToDate().date;
                                    break;
                                default:
                                    htmlDisplay = '' + data[attrId];
                            }
                        }
                        break;
                    case 'Array':
                        htmlDisplay = 'Array Content';
                        break;
                    case 'null':
                        htmlDisplay = 'Null Content';
                        break;
                    case 'Boolean':
                        htmlDisplay = '' + data[attrId];
                        break;
                    default:
                        htmlDisplay = 'Wrong info';
                        console.log('There exists problem');
                }

                $('#' + this._tableId + ' tr:nth-child(' + (this._rowIndex + 1) + ') td:nth-child(' + (columnIndex + 1) + ')')
                        .html(htmlDisplay);
            }

            $('#' + this._tableId + ' tr:nth-child(' + (this._rowIndex + 1) + ') td:first')
                    .html('<img class="button-img" src="' + imgDeleteButton + '">')
                    .find('img').click(function () {
                var rowIndex = $(this).parent().parent().index();
                deleteRow(_tableId, rowIndex);
                deleteColumn(LINK_MATRIX_TABLE_ID, linkMatrixMapping[_tableId][rowIndex]);
                deleteRow(LINK_MATRIX_TABLE_ID, linkMatrixMapping[_tableId][rowIndex]);
                removeLinkMatrixMapping(_tableId, rowIndex);
            });

            paLinkTypeMatrixList.push('#' + this._wiId);
            paLinkTypeMatrixList['#' + this._wiId] = [];

            for (var counter = 0; counter < paLinkTypeList[project][type].length; counter++) {
                var linkTypeName = paLinkTypeList[project][type][counter],
                        header = linkTypeEnableHeaderList[linkTypeEnableList.indexOf(linkTypeName)];
                if (data.hasOwnProperty(header)) {
                    var workitemList = data[header];
                    linktype.push(linkTypeName);
                    linktype[linkTypeName] = [];
                    for (var counterLv2 = 0; counterLv2 < workitemList.length; counterLv2++) {
                        var linkedId = REGEX_LAST_URI_PATH.exec(workitemList[counterLv2]['rdf:resource'])[0];
                        linktype[linkTypeName].push(linkedId);
                        linkTypeMatrix.push('#' + linkedId);
                        linkTypeMatrix['#' + linkedId] = linkTypeName;
                        paLinkTypeMatrixList['#' + this._wiId].push('#' + linkedId);
                        paLinkTypeMatrixList['#' + this._wiId]['#' + linkedId] = linkTypeName;
                    }
                }
            }

            info('The fetching workitem having Id "' + this._wiId + '" is completed.');
            if (this._tableId === EXISTING_WI_TABLE_ID) {
                linkMatrixMapping[this._tableId].push(this._rowIndex);
                linkMatrixMapping[this._tableId][this._rowIndex] = $('#' + LINK_MATRIX_TABLE_ID + ' tr').length - 1;

                $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ')')
                        .html('<a href="' + getUrl + '"><img src="' + paTypeList[project][type].iconUrl + '"/>' + this._wiId + ' : ' + paTypeList[project][type].title + '</a>')
                        .attr('wiId', this._wiId)
                        .attr('paId', project)
                        .attr('typeId', type);
                $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ') td:first')
                        .html('<a href="' + getUrl + '"><img src="' + paTypeList[project][type].iconUrl + '"/>' + this._wiId + ' : ' + paTypeList[project][type].title + '</a>')
                        .attr('wiId', this._wiId)
                        .attr('paId', project)
                        .attr('typeId', type);
                $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ') td:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ')').css("background-color", colorBackgroundGray);
                updateLinkTypeMatrix(this._tableId, this._rowIndex);
            }

            if (this._tableId === NEW_WI_TABLE_ID) {
                $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (linkMatrixMapping[this._tableId][this._rowIndex] + 1) + ')')
                        .html('<a href="' + getUrl + '"><img src="' + paTypeList[project][type].iconUrl + '"/>' + this._wiId + ' : ' + paTypeList[project][type].title + '</a>')
                        .attr('wiId', this._wiId)
                        .attr('paId', project)
                        .attr('typeId', type);
                $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkMatrixMapping[this._tableId][this._rowIndex] + 1) + ') td:first')
                        .html('<a href="' + getUrl + '"><img src="' + paTypeList[project][type].iconUrl + '"/>' + this._wiId + ' : ' + paTypeList[project][type].title + '</a>')
                        .attr('wiId', this._wiId)
                        .attr('paId', project)
                        .attr('typeId', type);
            }

            if (_updateLinkTypeStatus) {
                newWorkitemPresentCounter++;
                console.log('newWorkitemPresentCounter', newWorkitemPresentCounter, 'newWorkitemTotalCounter', newWorkitemTotalCounter);
                if (newWorkitemPresentCounter === newWorkitemTotalCounter && fetchDTO2WorkitemPresentCounter === fetchDTO2WorkitemTotalCounter) {
                    setTimeout(function () {
                        //Do nothing
                    }, 10000);
                    newWorkitemPresentCounter = 0;
                    fetchDTO2WorkitemPresentCounter = 0;
                    updateLinkTypeMapping();
                } else if (newWorkitemPresentCounter < newWorkitemTotalCounter) {
                    createUpdateWorkitems(presentWorkitemRowIndex + 1);
                }
            }
        },
        error: function (jqXHR, textStatus) {
            error('fetchExistingWorkItemInfoById: The workitem having Id "' + _wiId + '" is invalid.');
            console.error('fetchExistingWorkItemInfoById: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('fetchExistingWorkItemInfoById: error retrieving info for workitem ' + _wiId + '.');
        }
    });
}
function fetchWorkitemByWorkitemDTO2(_wiId, _paId) {
    var getUrl = protocol + host + '/ccm/service/com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItemDTO2?includeHistory=false&id=' + _wiId + '&projectAreaItemId=' + _paId;
    var jqXHR = $.ajax({
        method: 'GET',
        url: getUrl,
        wiId: _wiId,
        paId: _paId,
        headers: {
            'Accept': 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        success: function (data) {
            var attributes = data['soapenv:Body']['response']['returnValue']['value']['attributes'];
            workitemList.push('#' + this.wiId);
            workitemList['#' + this.wiId] = new Workitem(this.wiId, JSONgetValueOfKeyWithKeyAndValue(attributes, 'key', 'workItemType', 'value')['id'], this.paId);
            workitemList['#' + this.wiId].summary = JSONgetValueOfKeyWithKeyAndValue(attributes, 'key', 'summary', 'value')['content'];
            workitemList['#' + this.wiId].description = JSONgetValueOfKeyWithKeyAndValue(attributes, 'key', 'description', 'value')['content'];
            workitemList['#' + this.wiId].stateId = data['soapenv:Body']['response']['returnValue']['value']['stateId'];
            workitemList['#' + this.wiId].itemId = data['soapenv:Body']['response']['returnValue']['value']['itemId'];
            workitemList['#' + this.wiId].locationUri = data['soapenv:Body']['response']['returnValue']['value']['locationUri'];
            fetchDTO2WorkitemPresentCounter++;
            if (newWorkitemPresentCounter === newWorkitemTotalCounter && fetchDTO2WorkitemPresentCounter === fetchDTO2WorkitemTotalCounter) {
                setTimeout(function () {
                    //Do nothing
                }, 10000);
                newWorkitemPresentCounter = 0;
                fetchDTO2WorkitemPresentCounter = 0;
                updateLinkTypeMapping();
            }
        },
        error: function (jqXHR, textStatus) {
            console.error('#ERROR: fetchWorkitemByWorkitemDTO2: ' + textStatus + '  ' + jqXHR.responseText);
            console.error('#ERROR: fetchWorkitemByWorkitemDTO2: error retrieving enumerates for PA ' + _paId + '.');
        }
    });
}
/*
 * 
 
 * @param {type} _tableId
 * @param {type} _rowIndex
 * @returns {undefined} */
function removeLinkMatrixMapping(_tableId, _rowIndex) {
    var removeIndex = linkMatrixMapping[_tableId][_rowIndex];
    for (var counterLv1 = 0; counterLv1 < linkMatrixMapping.length; counterLv1++) {
        var tableId = linkMatrixMapping[counterLv1];
        for (var counterLv2 = 1; counterLv2 < linkMatrixMapping[tableId].length; counterLv2++) {
            if (linkMatrixMapping[tableId][counterLv2] < removeIndex) {
//Do nothing
            } else {
                if (tableId === _tableId) {
                    if (counterLv2 < (linkMatrixMapping[tableId].length - 1)) {
                        linkMatrixMapping[tableId][counterLv2] = linkMatrixMapping[tableId][counterLv2 + 1] - 1;
                    }
                } else {
                    linkMatrixMapping[tableId][counterLv2] = linkMatrixMapping[tableId][counterLv2] - 1;
                }
            }
        }
    }
    linkMatrixMapping[_tableId].splice(linkMatrixMapping[_tableId].length - 1, 1);
}
/*
 * 
 
 * @param {type} _tableId
 * @param {type} _rowIndex
 * @returns {undefined} */
function updateLinkTypeMatrix(_tableId, _rowIndex) {
    var linkTypeMatrixIndex = linkMatrixMapping[_tableId][_rowIndex];
    var rowCells = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkTypeMatrixIndex + 1) + ') td:not(:first-child):not(:nth-child(' + (linkTypeMatrixIndex + 1) + '))'),
            columnCells = $('#' + LINK_MATRIX_TABLE_ID + ' tr:not(:first-child):not(:nth-child(' + (linkTypeMatrixIndex + 1) + ')) td:nth-child(' + (linkTypeMatrixIndex + 1) + ')'),
            cells = $.merge($.merge([], rowCells), columnCells);
    if (typeof loadLinkTypes !== 'undefined') {
        updateLinkTypeTotalNumber = cells.length;
        updateLinkTypePresentNumber = 0;
    }
    //console.log('#DEBUG row',rowCells,'column',columnCells,'combination',cells);
    $.each(cells, function (index, value) {
        if (typeof $(value).parent().find('td:first-child').attr('typeId') === 'undefined'
                && $(value).parent().find('td:first-child').attr('paId') === 'NA') {
            $(value).html('<span style="display: inline-block; width: 16px; height: 16px;"/>' + CharSpace + 'Not chosen');
        } else {
            var paId = $(value).parent().find('td:first-child').attr('paId'),
                    typeId = $(value).parent().find('td:first-child').attr('typeId'),
                    rowIndex = $(value).closest('tr').index(),
                    columnIndex = $(value).closest('td').index();
            var emptyOption = $('<option/>').attr('itemId', 'NA').html('-'),
                    linkTypeComboBox = $('<select/>').append(emptyOption);
            for (var i = 0; i < paLinkTypeList[paId][typeId].length; i++) {
                var linktypeId = paLinkTypeList[paId][typeId][i];
                linkTypeComboBox.append($('<option/>')
                        .attr('itemId', linkTypeEnableList[i])
                        .html(imgLinkTypeStartLink + linkTypeEnableImgList[i] + imgLinkTypeEndLink + paLinkTypeList[paId][typeId][linktypeId].title));
            }
            $(value).html('<span style="display: inline-block; width: 16px; height: 16px;"/>' + CharSpace)
                    .append(linkTypeComboBox.clone())
                    .append(CharSpace + imageStartNonImgLink + imageList['refresh'] + imageEndNonImgLink)
                    .find('select:first').change(function () {
                linkTypeMatrixCellSelectChange(this);
            });
            $(value).find('span:last').click(function () {
                refreshLinkMatrixCell($(this).parent().find('select:first')[0]);
            });
            if (typeof $(value).parent().find('td:first-child').attr('wiId') !== 'undefined'
                    && typeof $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId') !== 'undefined') {
                var wiId = $(value).parent().find('td:first-child').attr('wiId'),
                        linkedWiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId');
                if (typeof paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId] !== 'undefined') {
                    var linktypeNumber = paLinkTypeList[paId][typeId].indexOf(paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId]);
                    $(value).find('select:first').prop('selectedIndex', linktypeNumber + 1);
                    $(value).find('span:first').attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[linktypeNumber] + imgLinkTypeStyleEndLink);
                }
            }
        }
        if (typeof loadLinkTypes !== 'undefined') {
            updateLinkTypePresentNumber++;
            if (updateLinkTypePresentNumber === updateLinkTypeTotalNumber) {
                loadLinkTypePresentNumber++;
                if (loadLinkTypePresentNumber === loadLinkTypeTotalNumber) {
                    loadLinkTypeValues();
                }
            }
        }
    });
}
function loadLinkTypeValues() {
    for (var rowCounter = 0; rowCounter < loadLinkTypes.length; rowCounter++) {
        for (var colCounter = 0; colCounter < loadLinkTypes.length; colCounter++) {
            if (rowCounter !== colCounter) {
                var selectedLinkType = loadLinkTypes[rowCounter][colCounter],
                        cell = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowCounter + 2) + ') td:nth-child(' + (colCounter + 2) + ')'),
                        selectedIndex = cell.find('select:first option[itemId="' + selectedLinkType + '"]').index();
                cell.find('select:first').prop('selectedIndex', selectedIndex);
                cell.find('span:first').attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[selectedIndex - 1] + imgLinkTypeStyleEndLink);
                if (selectedIndex !== 0) {
                    cell.attr('update', true)
                            .css("border", colorBorderGreen);
                }
            }
        }
    }
    loadLinkTypes = undefined;
}

/*
 * 
 * @param {type} _cell
 * @returns {undefined} */
function refreshLinkMatrixCell(_cell) {
    var rowIndex = $(_cell).closest('tr').index(),
            columnIndex = $(_cell).closest('td').index(),
            wiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first-child').attr('wiId'),
            corespondTypeId = linkTypeEnableList.indexOf($('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first-child select:first option:selected').attr('itemId'));
    if (typeof $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId') !== 'undefined'
            && typeof $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first').attr('wiId') !== 'undefined') {
        var linkedWiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId');
        if (typeof paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId] !== 'undefined') {
            $(_cell).prop('selectedIndex', linkTypeEnableList.indexOf(paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId]) + 1);
        } else {
            $(_cell).prop('selectedIndex', 0);
        }
        corespondTypeId = linkTypeEnableList.indexOf(paLinkTypeMatrixList['#' + linkedWiId]['#' + wiId]);
    } else {
        $(_cell).prop('selectedIndex', 0);
    }

    $(_cell).parent().find('span:first')
            .attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[linkTypeEnableList.indexOf($(_cell[_cell.selectedIndex]).attr('itemId'))] + imgLinkTypeStyleEndLink);
    $(_cell).parent()
            .css("border", colorBorderNone)
            .css("border-bottom", colorBorderBottmNone)
            .attr("update", false);
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (columnIndex + 1) + ') td:nth-child(' + (rowIndex + 1) + ')')
            .css('border', colorBorderNone)
            .css("border-bottom", colorBorderBottmNone)
            .attr("update", false)
            .find('select:first').prop('selectedIndex', corespondTypeId + 1)
            .parent().find('span:first').attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[corespondTypeId] + imgLinkTypeStyleEndLink);
}
/*
 * The value of a cell of link type matrix table is changed will lead to the coresponding change of its border and the picture
 * @param {type} _cell
 * @returns {undefined} */
function linkTypeMatrixCellSelectChange(_cell) {
    var rowIndex = $(_cell).closest('tr').index(),
            columnIndex = $(_cell).closest('td').index(),
            wiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first-child').attr('wiId'),
            paId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first-child').attr('paId'),
            typeId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first-child').attr('typeId'),
            linkTypeId = $(_cell[_cell.selectedIndex]).attr('itemId'),
            corespondTypeId = linkTypeEnableList.indexOf(linkTypeEnableList[listTypeEnableCorespondList.indexOf(linkTypeId)]),
            borderColorValue = colorBorderNone,
            changeFlag = false;
    if (typeof $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId') !== 'undefined'
            && typeof $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (rowIndex + 1) + ') td:first').attr('wiId') !== 'undefined') {
        var linkedWiId = $('#' + LINK_MATRIX_TABLE_ID + ' tr:first-child td:nth-child(' + (columnIndex + 1) + ')').attr('wiId');
        if (typeof paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId] !== 'undefined') {
            if ((paLinkTypeList[paId][typeId].indexOf(paLinkTypeMatrixList['#' + wiId]['#' + linkedWiId]) + 1) !== _cell.selectedIndex) {
                borderColorValue = colorBorderYellow;
                changeFlag = true;
            } else {
                borderColorValue = colorBorderNone;
            }
        } else {
            if (_cell.selectedIndex === 0) {
                borderColorValue = colorBorderNone;
            } else {
                borderColorValue = colorBorderGreen;
                changeFlag = true;
            }
        }
    } else {
        if (_cell.selectedIndex === 0) {
            borderColorValue = colorBorderNone;
        } else {
            borderColorValue = colorBorderGreen;
            changeFlag = true;
        }
    }
    $(_cell).parent().find('span:first').attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[linkTypeEnableList.indexOf($(_cell[_cell.selectedIndex]).attr('itemId'))] + imgLinkTypeStyleEndLink);
    $(_cell).parent()
            .css("border", borderColorValue)
            .attr("update", changeFlag);
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (columnIndex + 1) + ') td:nth-child(' + (rowIndex + 1) + ')')
            .css('border', borderColorValue)
            .attr("update", changeFlag)
            .find('select:first').prop('selectedIndex', corespondTypeId + 1)
            .parent().find('span:first').attr('style', imgLinkTypeStyleStatLink + linkTypeEnableImgList[corespondTypeId] + imgLinkTypeStyleEndLink);
    if (borderColorValue === colorBorderNone) {
        $(_cell).parent().css("border-bottom", colorBorderBottmNone);
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (columnIndex + 1) + ') td:nth-child(' + (rowIndex + 1) + ')').css("border-bottom", colorBorderBottmNone);
    }

}
function createNewWorkitemTable() {
    appendRow(NEW_WI_TABLE_ID);
    appendRow(LINK_MATRIX_TABLE_ID);
    appendColumn(LINK_MATRIX_TABLE_ID);
    var emptyOption = $('<option/>').attr('itemId', 'NA').html('&lt;Not chosen&gt;'),
            emptyComboBox = $('<select/>').append(emptyOption),
            paComboBox = $('<select/>').append($('<option/>').attr('itemId', 'NA').html('&lt;Project Area is not chosen&gt;'));
    $('#' + NEW_WI_TABLE_ID + ' tr:first th:not(:first-child)').each(function () {
        var columnIndex = $(this).index(),
                attrId = $(this).attr('itemId'),
                cell = $('#' + NEW_WI_TABLE_ID + ' tr:last td:nth-child(' + (columnIndex + 1) + ')');
        switch (wiAttributes.method[wiAttributes.oslcName.indexOf(attrId)]) {
            case 'String':
                switch (attrId) {
                    case 'rtc_cm:due':
                        var today = new Date(),
                                input = $('<input/>'),
                                object = today.getFullYear();
                        cell.css('white-space', 'nowrap');
                        cell.html('<input type="checkbox"/>');
                        input.addClass('short4digits').attr('type', 'number')
                                .attr('min', (object - 50))
                                .attr('max', (object + 50))
                                .attr('value', object);
                        cell.append(input.clone()).append('-');
                        input.removeClass('short4digits').addClass('short2digits');
                        input.attr('min', 1)
                                .attr('max', 12)
                                .attr('value', today.getMonth() + 1);
                        cell.append(input.clone()).append('-');
                        input.attr('min', 1)
                                .attr('max', 31)
                                .attr('value', today.getDate());
                        cell.append(input.clone());
                        break;
                    case 'dc:description':
                        cell.html('<textarea placeholder="' + StringClickAddText + '"></textarea>');
                        break;
                    case 'dc:created':
                        cell.html('-');
                        break;
                    case 'dc:title':
                        cell.html('<input type="text" placeholder="' + StringClickAddText + '">');
                        cell.find('input').on('input', function (e) {
                            if ($(this).val() !== '') {
                                $(this).parent().css('border', colorBorderNone)
                                        .css("border-bottom", colorBorderBottmNone);
                            } else {
                                $(this).parent().css('border', colorBorderRed);
                            }
                        });
                        break;
                    default:
                        cell.html('<input type="text" placeholder="' + StringClickAddText + '">');
                }
                break;
            case 'Link':
                switch (attrId) {
                    case 'dc:type':
                        cell.css('white-space', 'nowrap')
                                .html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                .append(emptyComboBox.clone());
                        break;
                    case 'rtc_cm:projectArea':
                        for (var i = 0; i < paNameList.length; i++) {
                            paComboBox.append(
                                    $('<option/>')
                                    .attr('itemId', paNameList[i])
                                    .html(paNameList[paNameList[i]])
                                    );
                        }
                        cell.css('white-space', 'nowrap')
                                .html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                .append(paComboBox.clone())
                                .find('select').change(function () {
                            var rowIndex = $(this).parent().parent().index();
                            $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
                            updateNewWorkitemInfoByPaId(rowIndex, UPDATE_ID);
                        });
                        break;
                    case 'dc:creator':
                        cell.html('-');
                        break;
                    case 'rtc_cm:state':
                        cell.html('-');
                        break;
                    default:
                        cell.append(emptyComboBox.clone());
                }
                break;
            case 'Number':
                switch (attrId) {
                    case 'dc:identifier':
                        cell.html('NEW');
                        break;
                    case 'rtc_cm:estimate':
                        var dateComboBox = $('<select/>')
                                .append($('<option/>').html('s'))
                                .append($('<option/>').html('m'))
                                .append($('<option/>').html('h'))
                                .append($('<option/>').html('d'))
                                .append($('<option/>').html('w'));
                        cell.css('white-space', 'nowrap')
                                .append($('<input type="text" placeholder="0"/>').addClass('short'))
                                .append(dateComboBox.prop('selectedIndex', 2));
                        cell.find('input').on('input', function (e) {
                            if ($.isNumeric($(this).val()) || $(this).val() === '') {
                                $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
                            } else {
                                $(this).parent().css('border', colorBorderRed);
                            }
                        });
                        break;
                    default:
                        cell.html('<input type="text" placeholder="Add number...">');
                }
                break;
            case 'Array':
                cell.html('Array Content');
                break;
            case 'null':
                cell.html('Null Content');
                break;
            case 'Boolean':
                cell.html('-');
                break;
            default:
                cell.html('-');
        }
    });
    $('#' + NEW_WI_TABLE_ID + ' tr:last td:first')
            .html('<img class="button-img" src="' + imgDeleteButton + '">')
            .find('img').click(function () {
        var rowIndex = $(this).parent().parent().index();
        deleteRow(NEW_WI_TABLE_ID, rowIndex);
        deleteColumn(LINK_MATRIX_TABLE_ID, linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex]);
        deleteRow(LINK_MATRIX_TABLE_ID, linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex]);
        removeLinkMatrixMapping(NEW_WI_TABLE_ID, rowIndex);
    });
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (0 + 1) + ') td:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ')')
            .html('Not chosen').attr('paId', 'NA')
            .removeAttr('wiId').removeAttr('typeId');
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ') td:nth-child(' + (0 + 1) + ')')
            .html('Not chosen').attr('paId', 'NA')
            .removeAttr('wiId').removeAttr('typeId');
    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ') td:nth-child(' + ($('#' + LINK_MATRIX_TABLE_ID + ' tr').length) + ')')
            .css("background-color", colorBackgroundGray);
    linkMatrixMapping[NEW_WI_TABLE_ID].push($('#' + NEW_WI_TABLE_ID + ' tr').length - 1);
    linkMatrixMapping[NEW_WI_TABLE_ID][$('#' + NEW_WI_TABLE_ID + ' tr').length - 1] = $('#' + LINK_MATRIX_TABLE_ID + ' tr').length - 1;
    info('Create new workitem information.');
    updateLinkTypeMatrix(NEW_WI_TABLE_ID, $('#' + NEW_WI_TABLE_ID + ' tr').length - 1);
    //HHM1HC: get information from the previous - only project area
    if ($('#' + NEW_WI_TABLE_ID + ' tr').length > 2) {
        var columnIndex = $('#' + NEW_WI_TABLE_ID + ' tr:first th[itemId="rtc_cm:projectArea"]').index();
        $('#' + NEW_WI_TABLE_ID + ' tr:last td:nth-child(' + (columnIndex + 1) + ')')
                .find('select:first')
                .prop('selectedIndex', $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + ($('#' + NEW_WI_TABLE_ID + ' tr').length - 1) + ') td:nth-child(' + (columnIndex + 1) + ') select:first').prop('selectedIndex'));
        updateNewWorkitemInfoByPaId($('#' + NEW_WI_TABLE_ID + ' tr').length - 1, NEW_ID);
    }
}
function updateNewWorkitemInfoByPaId(_rowIndex, _status) {
    var cells = $('#' + NEW_WI_TABLE_ID + ' tr:nth-child(' + (_rowIndex + 1) + ')')[0].cells,
            projectAreaIndex = $('#' + NEW_WI_TABLE_ID + " th[itemId='rtc_cm:projectArea']").index(),
            chosenPaId = $(cells[projectAreaIndex]).find('select option:selected').attr('itemId');
    if (chosenPaId === 'NA') { //Project area is not chosen
        var emptyComboBox = $('<select/>').append($('<option/>').attr('itemId', 'NA').html('&lt;Not chosen&gt;'));
        $('#' + NEW_WI_TABLE_ID + ' tr:first th:not(:first-child)').each(function () {
            var columnIndex = $(this).index(),
                    attrId = $(this).attr('itemId'),
                    cell = $('#' + NEW_WI_TABLE_ID + ' tr:last td:nth-child(' + (columnIndex + 1) + ')');
            switch (wiAttributes.method[wiAttributes.oslcName.indexOf(attrId)]) {
                case 'String':
                    break;
                case 'Link':
                    switch (attrId) {
                        case 'dc:type':
                            cell.css('white-space', 'nowrap')
                                    .html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                                    .append(emptyComboBox.clone());
                            break;
                        case 'rtc_cm:projectArea':
                            cell.css('border', colorBorderRed);
                            break;
                        case 'rtc_cm:filedAgainst':
                            cell.html('').append(emptyComboBox.clone());
                            break;
                        case 'rtc_cm:plannedFor':
                            cell.html('').append(emptyComboBox.clone());
                            break;
                        case 'rtc_cm:ownedBy':
                            cell.html('').append(emptyComboBox.clone());
                            break;
                        case 'oslc_cm:priority':
                            cell.html('').append(emptyComboBox.clone());
                            break;
                            /*case 'rtc_cm:state':
                             cell.html('-').append(emptyComboBox.clone());
                             break;*/
                        case 'oslc_cm:severity':
                            cell.html('').append(emptyComboBox.clone());
                            break;
                        case 'dc:creator':

                            break;
                        default:

                            //console.log('There exists problem');
                    }
                    break;
                case 'Number':
                    break;
                case 'Array':
                    break;
                case 'null':
                    break;
                case 'Boolean':
                    break;
                default:
                    //Do nothing
            }
        });
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][_rowIndex] + 1) + ')')
                .html('Not chosen').attr('paId', 'NA')
                .removeAttr('wiId').removeAttr('typeId');
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][_rowIndex] + 1) + ') td:first')
                .html('Not chosen').attr('paId', 'NA')
                .removeAttr('wiId').removeAttr('typeId');
        updateLinkTypeMatrix(NEW_WI_TABLE_ID, _rowIndex);
    } else {  //Project area is chosen
        $(cells[projectAreaIndex]).css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
        var comboBox = $('<select/>'),
                index = $('#' + NEW_WI_TABLE_ID + " th[itemId='dc:type']").index();
        for (var counter = 0; counter < paTypeList[chosenPaId].length; counter++) {
            var typeId = paTypeList[chosenPaId][counter];
            comboBox.append($('<option/>')
                    .attr('itemId', typeId)
                    .html('<img class="icon-img" src="' + paTypeList[chosenPaId][typeId].iconUrl + '">' + CharSpace + paTypeList[chosenPaId][typeId].title));
        }
        $(cells[index]).html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                .find('img:first').attr('src', paTypeList[chosenPaId][paTypeList[chosenPaId][0]].iconUrl);
        $(cells[index]).append(comboBox.clone())
                .find('select:first')
                .change(function () {
                    //If the type is changed, its image and link matrix first cells are changed following the context
                    var rowIndex = $(this).parent().parent().index(),
                            selectedIndex = this.selectedIndex;
                    $(this).parent().find('img:first').attr('src', paTypeList[chosenPaId][paTypeList[chosenPaId][selectedIndex]].iconUrl);
                    $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex] + 1) + ')')
                            .html(this[selectedIndex].innerHTML)
                            .attr('typeId', $(this[selectedIndex]).attr('itemId'));
                    $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][rowIndex] + 1) + ') td:first')
                            .html(this[selectedIndex].innerHTML)
                            .attr('typeId', $(this[selectedIndex]).attr('itemId'));
                    updateLinkTypeMatrix(NEW_WI_TABLE_ID, rowIndex);
                });
        index = $('#' + NEW_WI_TABLE_ID + " th[itemId='rtc_cm:filedAgainst']").index();
        comboBox = $('<select/>');
        for (var counter = 0; counter < paCategoryList[chosenPaId].length; counter++) {
            var itemId = paCategoryList[chosenPaId][counter];
            comboBox.append($('<option/>').attr('itemId', itemId).html(paCategoryList[chosenPaId][itemId]));
        }
        $(cells[index]).html('').append(comboBox.clone());
        $(cells[index]).find('select:first').change(function () {
            if ($(this).find('option:selected').html() === 'Unassigned') {
                $(this).parent().css('border', colorBorderRed);
            } else {
                $(this).parent().css('border', colorBorderNone).css("border-bottom", colorBorderBottmNone);
            }
        });
        index = $('#' + NEW_WI_TABLE_ID + " th[itemId='rtc_cm:plannedFor']").index();
        comboBox = $('<select/>')
                .append($('<option/>').attr('itemId', 'NA').html('Unassigned'));
        for (var counter = 0; counter < paIterationList[chosenPaId].length; counter++) {
            var itemId = paIterationList[chosenPaId][counter];
            comboBox.append($('<option/>').attr('itemId', itemId).html(paIterationList[chosenPaId][itemId].id));
        }
        $(cells[index]).html('').append(comboBox.clone());
        index = $('#' + NEW_WI_TABLE_ID + " th[itemId='rtc_cm:ownedBy']").index();
        comboBox = $('<select/>')
                .append($('<option/>').attr('itemId', 'NA').html('Unassigned'));
        for (var counter = 0; counter < paUserList[chosenPaId].length; counter++) {
            var itemId = paUserList[chosenPaId][counter];
            comboBox.append($('<option/>').attr('itemId', itemId).html(paUserList[chosenPaId][itemId].name));
        }
        $(cells[index]).html('').append(comboBox.clone());
        for (var counterLv1 = 0; counterLv1 < wiAttributes.enumerations.length; counterLv1++) {
            index = $('#' + NEW_WI_TABLE_ID + " th[itemId='" + wiAttributes.oslcName[counterLv1] + "']").index();
            if (index !== -1 && wiAttributes.enumerations[counterLv1] !== '-') {
                comboBox = $('<select/>');
                var existImg = false;
                for (var counter = 0; counter < paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals.length; counter++) {
                    var itemId = paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[counter]['id'],
                            name = paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[counter]['name'],
                            htmlDisplay = ('' + name);
                    if (typeof paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[counter]['iconUrl'] !== 'undefined') {
                        if (paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[counter]['iconUrl'] !== null) {
                            iconUrl = paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[counter]['iconUrl'];
                            htmlDisplay = '<img class="icon-img" src="' + iconUrl + '">' + CharSpace + name;
                            existImg = true;
                        }
                    }
                    comboBox.append($('<option/>').attr('itemId', itemId).html(htmlDisplay));
                }
                if (existImg) {
                    $(cells[index]).html('<img class="icon-img" src="/ccm/web/dojo/resources/blank.gif">' + CharSpace)
                            .css('white-space', 'nowrap')
                            .find('img:first').attr('src', paEnumerationList[chosenPaId][wiAttributes.enumerations[counterLv1]].literals[0]['iconUrl']);
                    $(cells[index]).append(comboBox.clone())
                            .find('select:first')
                            .change(function () {
                                var rowIndex = $(this).closest('td').index(),
                                        attrOSLC = $('#' + NEW_WI_TABLE_ID + ' tr:first th:nth-child(' + (rowIndex + 1) + ')').attr('itemId'),
                                        enumerationIndex = wiAttributes.oslcName.indexOf(attrOSLC);
                                $(this).parent()
                                        .find('img:first')
                                        .attr('src', paEnumerationList[chosenPaId][wiAttributes.enumerations[enumerationIndex]].literals[$(this).prop('selectedIndex')]['iconUrl']);
                            });
                } else {
                    $(cells[index]).html('').append(comboBox.clone());
                }
            }
        }

        if (_status === NEW_ID) {

        }

        var index = $('#' + NEW_WI_TABLE_ID + " th[itemId='dc:type']").index(),
                htmlDisplay = $(cells[index]).find("select:first option:selected").html();
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:first td:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][_rowIndex] + 1) + ')')
                .html(htmlDisplay)
                .removeAttr('wiId')
                .attr('paId', chosenPaId)
                .attr('typeId', $(cells[index]).find('option:selected').attr('itemId'));
        $('#' + LINK_MATRIX_TABLE_ID + ' tr:nth-child(' + (linkMatrixMapping[NEW_WI_TABLE_ID][_rowIndex] + 1) + ') td:first')
                .html(htmlDisplay)
                .removeAttr('wiId')
                .attr('paId', chosenPaId)
                .attr('typeId', $(cells[index]).find('option:selected').attr('itemId'));
        updateLinkTypeMatrix(NEW_WI_TABLE_ID, _rowIndex);
    }
}
function clearTableContent(table) {
    var i = table.rows.length - 1;
    while (i > 0) {
        if (!(table.rows[i].classList.contains('header'))) {
            table.deleteRow(i);
        }
        i--;
    }
}
function getResourceLink(entry) {
    return $(entry).find('.jazz-ui-ResourceLink').first().attr('href');
}
function getIdFromUrl(url) {
    if (url !== undefined) {
        return (/(id=)(\d*)\D?/.exec(url)[2]);
    }
}
function getSelectedItemId(selectId) {
    var e = document.getElementById(selectId);
    $selected = $(e.options[e.selectedIndex]);
    return $selected.attr('itemId');
}
function getSelectedItemValue(selectId) {
    var e = document.getElementById(selectId);
    return e.options[e.selectedIndex].value;
}
function warning(message) {
    clearColor($('#status-text'));
    $('#status-text').addClass('color-warning');
    $('#status-text').html(message);
}
function info(message) {
    clearColor($('#status-text'));
    $('#status-text').addClass('color-info');
    $('#status-text').html(message);
}
function error(message) {
    clearColor($('#status-text'));
    $('#status-text').addClass('color-error');
    $('#status-text').html(message);
}
function green(message) {
    clearColor($('#status-text'));
    $('#status-text').addClass('color-success');
    $('#status-text').html(message);
}
function clearColor(elem) {
    $(elem).removeClass(function (index, css) {
        return (css.match(/\bcolor-\S+/g) || []).join(' ');
    });
}
function refreshRootEntryObserver() {
    $rootEntry = $('.plannedItems', top.document).find('.root').children('.entryChildren');
    rootEntryObserver.disconnect();
    var config = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: false
    };
    if ($rootEntry.length) {
        console.log('#INFO: refreshRootEntryObserver: start observing ', $rootEntry[0]);
        rootEntryObserver.observe($rootEntry[0], config);
    } else {
        console.warn('#ERROR: refreshRootEntryObserver: cannot find rootEntry.');
    }
}
/*Section: GUI supporting functions*/
function appendColumnAttribute(_tableId, _attName, _attId) {
    var tbl = document.getElementById(_tableId),
            attNew = $('<th>' + _attName + '</th>').attr('itemId', _attId);
    $(tbl.rows[0]).append(attNew);
    for (var i = 1; i < tbl.rows.length; i++) {
        tbl.rows[i].insertCell(tbl.rows[i].cells.length);
    }
}
function appendRow(_tableId) {  // append row to the HTML table
    var tbl = document.getElementById(_tableId), // table reference
            row = tbl.insertRow(tbl.rows.length); // append table row
    // insert table cells to the new row
    for (var i = 0; i < tbl.rows[0].cells.length; i++) {
        row.insertCell(i);
    }
}
function appendColumn(_tableId) {  // append column to the HTML table
    var tbl = document.getElementById(_tableId); // table reference
    // open loop for each row and append cell
    for (var i = 0; i < tbl.rows.length; i++) {
        tbl.rows[i].insertCell(tbl.rows[i].cells.length);
    }
}
function deleteRow(_tableId, _rowIndex) {  // delete table rows with index greater then 0
    var tbl = document.getElementById(_tableId); // table reference
    tbl.deleteRow(_rowIndex); // delete rows with index greater then 0
    //HHM1HC: the full conditions is missing
}
function deleteColumn(_tableId, _columnIndex) {  // delete table columns with index greater then 0
    var tbl = document.getElementById(_tableId); // table reference
    // delete cells with index greater then 0 (for each row)
    for (i = 0; i < tbl.rows.length; i++) {
        tbl.rows[i].deleteCell(_columnIndex);
    }
//HHM1HC: the full conditions is missing
}
function deleteRows(_tableId) {  // delete table rows with index greater then 0
    var tbl = document.getElementById(_tableId), // table reference
            lastRow = tbl.rows.length - 1, // set the last row index
            i;
    // delete rows with index greater then 0
    for (i = lastRow; i > 0; i--) {
        tbl.deleteRow(i);
    }
}
function deleteColumns(_tableId) {  // delete table columns with index greater then 0
    var tbl = document.getElementById(_tableId), // table reference
            lastCol = tbl.rows[0].cells.length - 1, // set the last column index
            i, j;
    // delete cells with index greater then 0 (for each row)
    for (i = 0; i < tbl.rows.length; i++) {
        for (j = lastCol; j > 0; j--) {
            tbl.rows[i].deleteCell(j);
        }
    }
}
/*Section: Addition functions for object conversions*/
Number.prototype.convertToDate = function (date) {
    var output = this;
    switch (date) {
        case 's':
            output = Math.round(this / 1000);
            break;
        case 'm':
            output = Math.round(this / 1000 / 60);
            break;
        case 'h':
            output = Math.round(this / 1000 / 60 / 60);
            break;
        case 'd':
            output = Math.round(this / 1000 / 60 / 60 / 24);
            break;
        case 'w':
            output = Math.round(this / 1000 / 60 / 60 / 24 / 7);
            break;
        default:
            console.error("Wrong date conversion");
    }
    return output;
};
Number.prototype.convertFromMilisecondToDate = function () {
    var estimate = parseInt(this),
            dateList = [],
            normalDateList = [],
            number = this / 1000,
            date = 's';
    dateList.push('w', 'd', 'h', 'm', 's');
    normalDateList.push('s', 'm', 'h', 'd', 'w');
    for (var counter = 0; counter < dateList.length; counter++) {
        date = dateList[counter];
        number = estimate.convertToDate(date);
        if (number > 1 && parseInt(number) === number) {
            counter = dateList.length;
        }
    }
    return {number: number,
        date: date};
};
Number.prototype.convertToMiliseconds = function (date) {
    var output = this;
    switch (date) {
        case 's':
            output = this * 1000;
            break;
        case 'm':
            output = this * 1000 * 60;
            break;
        case 'h':
            output = this * 1000 * 60 * 60;
            break;
        case 'd':
            output = this * 1000 * 60 * 60 * 24;
            break;
        case 'w':
            output = this * 1000 * 60 * 60 * 24 * 7;
            break;
        default:
            console.error("Wrong date conversion");
    }
    return output;
};
String.prototype.shortDate = function () {
    return this.substring(0, 16).replace('T', ' ');
};
String.prototype.removeLastEleWithDelimiter = function (delimiter) {
    var a = this.split(delimiter);
    a.splice(-1, 1);
    return a.join(delimiter);
};
/*JSON workaround*/
function JSONgetValueOfKeyWithKeyAndValue(data, key, value, searchKey) {
    for (var i in data) {
        if (data.hasOwnProperty(i) && data[i][key] === value)
            return data[i][searchKey];
    }
}
