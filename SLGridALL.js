(function () {
    // Private function
    function getColumnsForScaffolding(data) {
        if ((typeof data.length !== 'number') || data.length === 0) {
            return [];
        }
        var columns = [];
        for (var propertyName in data[0]) {
            columns.push({ headerText: propertyName, colName: propertyName });
        }
        return columns;
    }

    // Templates used to render the grid
    var templateEngine = new ko.nativeTemplateEngine();

    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    templateEngine.addTemplate("ko_SLGrid_grid", "\
                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" data-bind=\"css: { 'table-bordered': tableBordered }\" class=\"SLGrid table table-hover table-condensed\" style=\"margin-bottom: 5px;\">\
                    <thead>\
                        <tr data-bind=\"foreach: columns\">\
                            <th data-bind=\"style: { width: width }\">\
                                <a href=\"#\" data-bind=\"attr: {'data-sort': colName, 'class': sortable ? 'sortable': 'non-sortable'}, enable:sortable\">\
                                    <span data-bind=\"html: headerText\"></span>\
					                <!-- ko if: sortable -->\
					                    <!-- ko ifnot: isSortColumn -->\
                                        &nbsp;<i class='fa fa-sort'></i><i class='fa fa-caret-up' style='display:none'></i><i class='fa fa-caret-down' style='display:none'></i>\
                                        <!-- /ko -->\
					                    <!-- ko if: isSortColumn -->\
                                        &nbsp;<i class='fa fa-sort' style='display:none'></i><i class='fa fa-caret-up'></i><i class='fa fa-caret-down' style='display:none'></i>\
                                        <!-- /ko -->\
                                    <!-- /ko -->\
                                </a>\
                            </th>\
                        </tr>\
                    </thead>\
                    <tbody data-bind=\"template: { name: whichTpl4Row, foreach: itemsAtPage, afterRender: afterRenderTR  }\">\
                    </tbody>\
                </table>");

    // PagerTemplate
    // disabledAnchor:!leftPagerEnabled() instead of visible
    templateEngine.addTemplate("ko_SLGrid_pageLinks", "\
                <ul class='pagination' style='margin: 0px;'>\
                    <li><a href='#' data-bind=\"visible:leftPagerEnabled, click: $root.leftPagerClick\">&laquo;</a></li>\
                    <!-- ko foreach: ko.utils.range(startPagerIndex, endPagerIndex) -->\
                        <li data-bind='css: { active: $data == $root.currentPageIndex() }'>\
                            <a href='#' data-bind='text: $data + 1, click: function() { $root.setCurrentPageIndex($data) }'></a>\
                        </li>\
                    <!-- /ko -->\
                    <li ><a href='#'data-bind=\"visible: rightPagerEnabled, click: $root.rightPagerClick\">&raquo;</a></li>\
                </ul>");

    // The "SLGrid" binding
    ko.bindingHandlers.SLGrid = {

        init: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();
            viewModel.Subscribe();
            return { 'controlsDescendantBindings': true };
        },

        // This method is called to initialize the node, and will also be called again if you change what the grid is bound to
        update: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();
            // Empty the element
            while (element.firstChild)
                ko.removeNode(element.firstChild);

            // Allow the default templates to be overridden
            var gridTemplateName = allBindings.get('SLGridTemplate') || "ko_SLGrid_grid";

            // Render the main grid
            var gridContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(gridTemplateName, viewModel, { templateEngine: templateEngine, afterRender: viewModel.afterRenderGrid }, gridContainer, "replaceNode");
        }

    };

    // The "SLGridPager" binding
    ko.bindingHandlers.SLGridPager = {

        init: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();
            return { 'controlsDescendantBindings': true };
        },

        // This method is called to initialize the node, and will also be called again if you change what the grid is bound to
        update: function (element, viewModelAccessor, allBindings) {
            var viewModel = viewModelAccessor();
            // Empty the element
            while (element.firstChild)
                ko.removeNode(element.firstChild);

            // Allow the default templates to be overridden
            var pageLinksTemplateName = allBindings.get('SLGridPagerTemplate') || "ko_SLGrid_pageLinks";

            // Render the page links
            var pageLinksContainer = element.appendChild(document.createElement("DIV"));
            ko.renderTemplate(pageLinksTemplateName, viewModel, { templateEngine: templateEngine }, pageLinksContainer, "replaceNode");
        }

    };

})();
// --------------------------
//   STAM Binding Handlers
// --------------------------

ko.bindingHandlers.disabledAnchor = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        ko.bindingHandlers.css.update(element, function () { return { anchorDisabled: value }; });
    }
};

ko.extenders.primaryKey = function (target, option) {
    target['primaryKey'] = option;
    return target;
};

ko.extenders.headerText = function (target, option) {
    target['headerText'] = option;
    return target;
};

ko.extenders.readOnly = function (target, option) {
    target['readOnly'] = option;
    return target;
};

ko.extenders.options = function (target, options) {
    target['options'] = options;
    return target;
};


ko.extenders.formLabel = function (target, option) {
    target['formLabel'] = option;
    return target;
};

ko.extenders.sortable = function (target, option) {
    target['sortable'] = option;
    return target;
};

ko.extenders.width = function (target, option) {
    target['width'] = option;
    return target;
};

ko.extenders.defaultValue = function (target, option) {
    target['defaultValue'] = option;
    //target(option);
    return target;
};

ko.extenders.presentation = function (target, option) {
    target['presentation'] = option;
    return target;
};


// -------------
// bsRowEditLink
// -------------

ko.bindingHandlers.bsRowEditLink = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //var viewModel = viewModelAccessor();
        var value = valueAccessor();
        var mode = viewModel.rowDisplayMode();  //ko.unwrap(value);
        var colName = $(element).data("field"); //allBindings.get('colName');
        var isDelete = false,
                        isEdit = false,
                        isField = false,
                        icon = "fa-toggle-right";

        switch (mode) {
            case "rowView":
                isEdit = false
                icon = "fa-edit" // opposite
                break
            case "rowEdit":
            case "rowAdd":
                isEdit = true
                icon = "fa-save" //"fa-toggle-left" // opposite
                break
            case "rowDelete":
                isDelete = true
                icon = "fa-times"
                break
            default:
                isField = true
        }
        //bindingContext.$data.displayMode(isEdit ? "Edit" : "View");
        //var isField = $.inArray(colName, ["viewForm", "editForm", "deleteForm"]) == -1;
        //var icon = isEdit ? "fa-edit" : isDelete ? "fa-times" : "fa-toggle-right";
        $("<a href='#' style='white-space: nowrap;' class='edit-entity' data-bind=\", click: rowEditClick, disabledAnchor: !actionsEnabled()\">" +
                        (isField ? "<span data-bind=\"text: " + colName + "\"></span>" : "<i class='fa " + icon + "'></i>") +
                    "</a>")
                        .appendTo(element)
        if (isEdit)
            $("<a href='#' style='white-space: nowrap;' class='edit-entity' data-bind=\", click: rowEditCancel, disabledAnchor: !actionsEnabled()\">\
                        &nbsp;<i class='fa fa-times-circle'></i>\
                    </a>")
            .appendTo(element)
    }
};


ko.bindingHandlers.bsRowDeleteLink = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //var viewModel = viewModelAccessor();
        var value = valueAccessor();
        //var mode = ko.unwrap(value);
        var mode = viewModel.rowDisplayMode()
        var colName = $(element).data("field"); //allBindings.get('colName');
        var isDelete = true,
            icon = "fa-times";
        //bindingContext.$data.displayMode(isEdit ? "Edit" : "View");
        //var isField = $.inArray(colName, ["viewForm", "editForm", "deleteForm"]) == -1;
        //var icon = isEdit ? "fa-edit" : isDelete ? "fa-times" : "fa-toggle-right";
        $("<a href='#' style='white-space: nowrap;' class='edit-entity' data-bind=\"disabledAnchor: !actionsEnabled()\">\
                        <i class='fa " + icon + "'></i>\
                    </a>")
                        .appendTo(element)
                        .on("click", function (e) {
                            Trace("click");
                            if (bindingContext.$data.actionsEnabled()) {
                                bindingContext.$data.remove();
                            }
                            e.preventDefault();
                            e.stopPropagation();
                        });
    }
};

// -------------
// bsPopoverLink
// -------------

ko.bindingHandlers.bsPopoverLink = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //var viewModel = viewModelAccessor();
        var value = valueAccessor();
        //var mode = ko.unwrap(value);

        var mode = viewModel.rowDisplayMode()
        var colName = $(element).data("field"); //allBindings.get('colName');
        var isDelete = false,
                        isEdit = false,
                        isField = false,
                        icon = "fa-toggle-right";

        switch (colName) {
            case "viewForm":
                break
            case "editForm":
            case "addForm":
                isEdit = true
                icon = "fa-edit"
                break
            case "deleteForm":
                isDelete = true
                icon = "fa-times"
                break
            default:
                isField = true
        }
        //bindingContext.$data.displayMode(isEdit ? "Edit" : "View");
        //var isField = $.inArray(colName, ["viewForm", "editForm", "deleteForm"]) == -1;
        //var icon = isEdit ? "fa-edit" : isDelete ? "fa-times" : "fa-toggle-right";
        if (mode == "rowEdit" || mode == "rowAdd") {
            $("<input class=\"form-control\" data-field=\"" + colName + "\" data-bind=\"value: " + colName + ", valueUpdate:'keyup'\"></input>")
                .appendTo(element)
        }
        //else if (mode == "View") {
        //    $("<span data-field=\"" + colName + "\" data-bind=\"text: " + colName + "\"></span>")
        //        .appendTo(element)
        //}
        else {
            $("<a href='#' style='white-space: nowrap;' class='edit-entity' data-bind=\"disabledAnchor: !actionsEnabled()\">" +
                        (isField ? "<span data-bind=\"text: " + colName + "\"></span>" : "<i class='fa " + icon + "'></i>") +
                    "</a>")
                        .appendTo(element)
                        .popover({
                            html: true,
                            title: function () {
                                return viewModel.entityName; // "Person";
                            },
                            content: function () {
                                //var Id = $(this).closest("tr").attr('personId');
                                //var Id = bindingContext.$data.PersonId();
                                //var markup = isEditForm ? $('#person-edit-template').html() : $('#person-template').html();
                                //return "<div class='' id='person-form-" + Id + "'>" + markup + "</div>";
                                return "<div class='' data-bind=\"attr: {id:'" + viewModel.entityName.toLowerCase() + "-form-'+" + viewModel.primaryKeyName + "()}, template: { name: whichTpl, data: $data, afterRender: afterRenderForm }\"></div>";
                            },
                            container: "body",
                            placement: function (tip, elem) {
                                var e = null;
                                // viewModel is Person
                                bindingContext.$data.isDelete(isDelete);
                                if (isEdit) {
                                    bindingContext.$data.displayMode("Edit");
                                    bindingContext.$data.renderEditTemplate(elem, e);
                                }
                                else {
                                    bindingContext.$data.displayMode("View");
                                    bindingContext.$data.renderViewTemplate(elem, e);
                                }
                                return "auto left";
                            },
                            trigger: "manual"
                        })
                        .on("shown.bs.popover", function (e, c, d) {
                            Trace("shown.bs.popover");
                            $(this).addClass('popoverShown');
                        })
                        .on("hide.bs.popover", function () {
                            Trace("hide.bs.popover");
                            ko.cleanNode($(this).data('bs.popover').tip()[0]);
                        })
                        .on("hidden.bs.popover", function () {
                            Trace("hidden.bs.popover");
                            $(this).removeClass('popoverShown');
                        })
                        .on("click", function (e) {
                            Trace("click");
                            if (bindingContext.$data.actionsEnabled()) {
                                var wasOpened = $(this).hasClass("popoverShown");
                                $('.edit-entity.popoverShown').popover('hide');
                                if (!wasOpened)
                                    $(this).popover('show');
                            }
                            e.preventDefault();
                            e.stopPropagation();
                        });
        }

    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        //var mode = ko.unwrap(value);
        var mode = viewModel.rowDisplayMode();
        var elem = $(element).find("a:first");
        if (elem.hasClass('popoverShown') && mode != "Delete") {
            /*
            var form = bindingContext.$data.getForm();
            ko.cleanNode(elem.data('bs.popover').tip()[0]);
            if (mode == "Edit") {
            var markup = $('#person-edit-template').html();
            $(form).html(markup);
            bindingContext.$data.renderEditTemplate(elem, null);
            }
            else {
            var markup = $('#person-template').html();
            $(form).html(markup);
            bindingContext.$data.renderViewTemplate(elem, null);
            }
            */
        }
        //var viewModel = viewModelAccessor();
    }
};


// -------------
// bsActionLink
// -------------

ko.bindingHandlers.bsActionLink = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //var viewModel = viewModelAccessor();
        var value = valueAccessor();
        //var mode = ko.unwrap(value);
        var inRow = allBindings.get("inRow");
        var mode = inRow ? viewModel.rowDisplayMode() : viewModel.displayMode();
        var colName = $(element).data("field"); //allBindings.get('colName');
        var isDelete = false,
                        isEdit = false,
                        isField = colName == "goDetails" ? false : true,
                        icon = "fa-toggle-right";
        if (typeof colName == 'undefined')
            return;
        var options = viewModel.__proto__[colName].options
        if (mode == "rowEdit" || mode == "rowAdd" || mode == "Add" || mode == "Edit") {
            if (options.readOnly) {  // todo use readOnly out of options
                $("<span class=\"form-control\" data-field=\"" + colName + "\" data-bind=\"text: " + colName + "\"></span>")
                    .appendTo(element)
            }
            else {
                $("<input class=\"form-control\" data-field=\"" + colName + "\" data-bind=\"value: " + colName + ", valueUpdate:'keyup'\"></input>")
                    .appendTo(element)
            }
        }
        //else if (mode == "View") {
        //    $("<span data-field=\"" + colName + "\" data-bind=\"text: " + colName + "\"></span>")
        //        .appendTo(element)
        //}
        else {
            if (options.action.match("^javascript:")) {
                $("<a href='#' data-bind=\"click : " + options.action.substr(11) + ", disabledAnchor: !actionsEnabled()\" style='white-space: nowrap;' class='edit-entity'>" +
                            (isField ? "<span " + (options.badgeColor ? "class='badge pull-right' style='margin-right:5px;background-color:" + options.badgeColor + "'" : "") + "data-bind=\"text: " + colName + "\"></span>" : "<i class='fa " + icon + "'></i>") +
                        "</a>")
                    .appendTo(element)
            }
            else {
                $("<a href='" + options.action + "?" + viewModel.primaryKeyName + "=" + viewModel[viewModel.primaryKeyName]() + "' style='white-space: nowrap;' class='edit-entity' data-bind=\"disabledAnchor: !actionsEnabled()\">" +
                            (isField ? "<span data-bind=\"text: " + colName + "\"></span>" : "<i class='fa " + icon + "'></i>") +
                        "</a>")
                    .appendTo(element)
            }
        }

    }
};

// ------------------------
// bsSelect
// ------------------------

ko.bindingHandlers.bsSelect = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        //var mode = ko.unwrap(value);
        var mode = viewModel.rowDisplayMode()
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        //var mode = ko.unwrap(value); // displayMode or isEditRow
        var mode = viewModel.rowDisplayMode()
        var colName = $(element).data("field");
        var inRow = allBindings.get("inRow");
        var tpl = inRow ? "row-city-select-template" : "form-city-select-template";
        // var tpl = bindingContext.$data.templates[mode];
        //var observable = valueAccessor();
        // we don't have options after new Person()
        //var options = bindingContext.$data[colName].options;
        //$(element).addClass("starRating");
        $(element)
            .html($("#" + tpl).html())
            .on('click', 'a', function (e) {
                var id = $(this).data('id');
                bindingContext.$data.CityId(id);
            });

    }
    };

    


    // ------------------------
    // bsText
    // ------------------------

    ko.bindingHandlers.bsText = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            //var mode = ko.unwrap(value);
            var mode = viewModel.rowDisplayMode()
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            //var mode = ko.unwrap(value); // displayMode or isEditRow
            var mode = viewModel.rowDisplayMode();
            var colName = $(element).data("field");
            var inRow = allBindings.get("inRow");
            var tpl = inRow ? "row-city-select-template" : "form-city-select-template";
            // var tpl = bindingContext.$data.templates[mode];
            //var observable = valueAccessor();
            // we don't have options after new Person()
            //var options = bindingContext.$data[colName].options;
            //$(element).addClass("starRating");
            $(element)
            .html($("#" + tpl).html())
            .on('click', 'a', function (e) {
                var id = $(this).data('id');
                bindingContext.$data.CityId(id);
            });

        }
    };


    // ------------------------
    // bsDatePicker
    // ------------------------

    ko.bindingHandlers.bsDatePicker = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            //var mode = ko.unwrap(value);
            //var mode = viewModel.rowDisplayMode();
            var inRow = allBindings.get("inRow");
            var colName = $(element).data("field");
            var markup = "<div class='input-group'>";

            var options = viewModel.__proto__[colName].options;
            var pickDate = options == undefined || options.pickDate == undefined || options.pickDate == true ? true : false;

            var value_utc = new Date(value().getUTCFullYear(), value().getUTCMonth(), value().getUTCDate(), value().getUTCHours(), value().getUTCMinutes(), value().getUTCSeconds())
            var dateStr = (value().getUTCMonth() + 1) + "/" + value().getUTCDate() + "/" + value().getUTCFullYear()  + " " + value().getUTCHours() + ":" + value().getUTCMinutes() + ":" + value().getUTCSeconds();
            //value().toUTCString()
            var str = (pickDate ? dateStr : value_utc.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"));
            var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
            if (isViewMode) {
                if (options && options.action && options.action.match("^javascript:")) {
                    markup += "<a href='#' data-bind=\"click: " + options.action.substr(11) + ", disabledAnchor: !actionsEnabled()\" style='white-space: nowrap;' class='edit-entity'>\
                                    <span>" + str + "</span>\
                                </a>";
                }
                else {
                    markup += "<span>" + str + "</span>"
                }
            }
            else {
                markup += "<div class='input-group date' id='datetimepicker1'>\
                    <input type='text' class='input-medium !form-control' />\
                        <span class='input-group-addon datetime'>\
                            <span class='glyphicon glyphicon-calendar'></span>\
                        </span>\
                 </div>";
            }
            markup += "</div>";



            $(element)
                .html(markup)

            if (!isViewMode) {
                $(element.firstChild)
                    .datetimepicker({
                        language: 'en',
                        showToday: true,
                        weekStart: 1,
                        pick12HourFormat: false,
                        pickDate: pickDate
                    })
                    .on('changeDate', function (e) {
                        //alert(e.date.toString());
                        //alert(e.localDate.toString());
                        var observable = valueAccessor();  // Get the associated observable
                        observable(e.date);
                    });

                var picker = $(element.firstChild).data('datetimepicker');
                picker.setDate(valueAccessor()())
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            //var mode = ko.unwrap(value); // displayMode or isEditRow
            //var mode = viewModel.rowDisplayMode();
            var colName = $(element).data("field");
            var inRow = allBindings.get("inRow");
            // var tpl = bindingContext.$data.templates[mode];
            //var observable = valueAccessor();
            // we don't have options after new Person()
            //var options = bindingContext.$data[colName].options;
            //$(element).addClass("starRating");
        }
    };




    // ----------------
    // bsCheckbox
    // ----------------

    ko.bindingHandlers.bsCheckbox = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            var value = valueAccessor();
            var mode = viewModel.rowDisplayMode()
            var inRow = allBindings.get("inRow");

            var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
            var markup = isViewMode ? (value() ? "<i class='fa fa-check'></a>" : "" /*"no"*/) : 
                "<input type=\"checkbox\" data-bind=\"checked: " + $(element).data("field") + "\" />";

            $(element).html(markup)

            if (isViewMode) {
            }
            else {
                /*
                if (viewModel.cityItems == undefined) {
                viewModel.cityItems = ko.observableArray([])
                viewModel.dropDownCities = new DropDownCities();
                viewModel.dropDownCities.getItems("", viewModel.cityItems);
                viewModel.cityItemChange = function (city, event) {
                viewModel.CityId(city.CityId());
                }
                }
                */

                /*
                $(element)
                .on('click', 'a', function (e) {
                var id = $(this).data('id');
                bindingContext.$data.CityId(id);
                });
                */

                //$(element).find('input').attr('readonly', 'readonly');
            }
           
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
           
        }
    }


    ko.bindingHandlers.bsStatus = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor())
            var mode = viewModel.rowDisplayMode()
            var inRow = allBindings.get("inRow");
            var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
            var markup = /*isViewMode ?*/
                (value == 1 ? "<span class='badge alert-success'>Success</span>" : "<span class='badge alert-danger'>Failure</span>")

            $(element).html(markup)
        }
    }

// -----------------
// SLGridViewModel
// -----------------

function SLGridViewModel(configuration) {
    var self = this; 
    this.itemsAtPage = ko.observableArray([]);

    // If you don't specify columns configuration, we'll use scaffolding
    // this.columns = configuration.columns || getColumnsForScaffolding(ko.unwrap(this.itemsAtPage));
    this.columns = configuration.columns;
    this.listHeader = ko.observable(configuration.listTpl.listHeader);
    this.textAdd = ko.observable(configuration.listTpl.textAdd);
    this.textPager = ko.observable(configuration.listTpl.textPager);
    this.filterInputId = ko.observable(configuration.listTpl.filterInputId);

    this.tableBordered = ko.observable(typeof configuration.tableBordered == "undefined" ? true : configuration.tableBordered);

    this.currentPageIndex = ko.observable(0);
    this.maxPageIndex = ko.observable(0);
    this.nItems = ko.observable(0); // filtered result set 

    this.setCurrentPageIndex = function (pageIndex) {
        this.currentPageIndex(pageIndex);
        this.Subscribe(pageIndex + 1);
    }

    // -------------
    // pager
    // -------------

    self.itemsOnPager = ko.observable(5);  // max 10 items in pager
    self.currentPagerIndex = ko.observable(0);

    self.startPagerIndex = ko.computed(function () {
        return self.currentPagerIndex() * self.itemsOnPager()
    });
    self.endPagerIndex = ko.computed(function () {
        return Math.min((self.currentPagerIndex() + 1) * self.itemsOnPager() - 1, self.maxPageIndex())
    });

    self.leftPagerEnabled = ko.computed(function () {
        return self.startPagerIndex() > 0;
    });
    this.leftPagerClick = function () {
        if (this.leftPagerEnabled()) {
            this.currentPagerIndex(this.currentPagerIndex() - 1)
            this.setCurrentPageIndex(self.startPagerIndex())
        }
    };

    self.rightPagerEnabled = ko.computed(function () {
        return self.endPagerIndex() < self.maxPageIndex();
    });
    this.rightPagerClick = function () {
        if (this.rightPagerEnabled()) {
            this.currentPagerIndex(self.currentPagerIndex() + 1)
            this.setCurrentPageIndex(self.startPagerIndex())
        }
    };

    this.afterRenderGrid = function (elems, vm) {
        $.each(elems, function (i, el) {
            if (el.tagName == "TABLE") {
                $("thead", el).on("click", "a", function (e) {
                    var $a = $(this);
                    var $tr = $(this).closest("tr");
                    var asc = true;
                    if ($a.find("i.fa-caret-up").is(":visible")) {
                        asc = false;
                        $a.find('i.fa-caret-up').hide();
                        $a.find('i.fa-caret-down').show();
                        $a.find('i.fa-sort').hide();
                    }
                    else if ($a.find("i.fa-caret-down").is(":visible")) {
                        $a.find('i.fa-caret-down').hide();
                        $a.find('i.fa-caret-up').show();
                        $a.find('i.fa-sort').hide();
                    }
                    else {
                        $tr.find('i.fa-sort').show();
                        $tr.find('i.fa-caret-up, i.fa-caret-down').hide();
                        $a.find('i.fa-sort').hide();
                        $a.find('i.fa-caret-up').show();
                    }
                    vm.OrderBy($(this).data("sort"), asc);
                });
            }
        });
    }
}
// ================================
//   SLEntity
// ================================

var SLEntity = function (element, options) {
    /*
    this.type =
    this.options =
    this.enabled =
    this.timeout =
    this.hoverState =
    this.$element = null

    this.init('tooltip', element, options)
    */
    this.isNew = ko.observable(false);
    this.gridViewModel == null;
 
    this.displayMode = ko.observable(this.isNew() ? "Add" : "View")

    this.actionsEnabled = ko.computed(function () {
        return this.isPopoverShown() ? false :
            this.isNew() ? true :
                this.gridViewModel == null || !this.gridViewModel.isAdding();
    }, this);
}



SLEntity.prototype.DEFAULTS = {
    animation: true, 
    placement: 'top'
}

SLEntity.prototype.displayModes = {
    rowView : 1,
    rowEdit : 2,
    rowAdd : 3,
    View : 4,
    Edit : 4,
    Add : 5
}

// row modes
SLEntity.prototype.isRowViewMode = function () {
    return this.rowDisplayMode() == "rowView"
};

SLEntity.prototype.isRowEditMode = function () {
    return this.rowDisplayMode() == "rowEdit"
};

SLEntity.prototype.isRowAddMode = function () {
    return this.rowDisplayMode() == "rowAdd"
};

SLEntity.prototype.isRowEditOrAddMode = function () {
    return this.rowDisplayMode() == "rowEdit" || this.rowDisplayMode() == "rowAdd"
};

// form modes

SLEntity.prototype.isViewMode = function () {
    return this.displayMode() == "View"
};

SLEntity.prototype.isEditMode = function () {
    return this.displayMode() == "Edit"
};

SLEntity.prototype.isAddMode = function () {
    return this.displayMode() == "Add"
};

SLEntity.prototype.isEditOrAddMode = function () {
    return this.displayMode() == "Edit" || this.displayMode() == "Add"
};

//SLEntity.prototype.init = function (type, element, options) {
//    this.enabled = true
//    this.type = type
//    this.$element = $(element)
//    this.options = this.getOptions(options)
//}

SLEntity.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
}

SLEntity.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
    return options
}

SLEntity.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e = $.Event('hide.bs.' + this.type)
    this.$element.trigger(e)
    return this
}


SLEntity.prototype.ignoreColumns = [
    "ignoreColumns",
    "Columns",
    "generateFormTemplate",
    "generateEditFormTemplate",
    "generateEditFormInlineTemplate",
    "generateRowTemplate",
    "valuesBeforeEdit",
    "viewModel",
    "typeaheadInitialized",
    "bloodhound",
    "initTypeahead",
    "attachTypeahead",
    "onFilter"
    ]

SLEntity.prototype.getIgnores = function () {
    /*
    var arr = ["isEditable", "valuesBeforeEdit", "pos"];
    debugger
    $.each(this, function (name, value) {
    if (typeof value == "function" && ko.isComputed(value))
    arr.push(name);
    });
    */
    var arr = [];
    $.each(this, function (name, value) {
        if (!(typeof value == "function" && (value.headerText != undefined || value.formLabel)))
            arr.push(name);
    });
    return arr;
}

SLEntity.prototype.getGridColumns = function (orderByColumn) {
    var columns = [];
    $.each(this, function (name, value) {
        if (value && !ko.isComputed(value) && value.headerText != undefined) {
            var sortable = value.sortable == undefined ? true : value.sortable;
            columns.push({
                headerText: value.headerText,
                sortable: sortable,
                isSortColumn: name == orderByColumn,
                width: (value.width || 'auto'),  // "80px"
                colName: name
            });
        }
    });
    return columns;
}


SLEntity.prototype.generateFormTemplate = function () {
    var arr = [];
    var ignoreColumns = this.ignoreColumns;
    arr.push("<form class=\"form-horizontal\" role=\"form\">");
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.formLabel) {
            arr.push("<div class=\"form-group\">");
            arr.push("  <label for=\"" + name + "\" class='col-sm-4 control-label'>" + value.formLabel + ":</label>");
            if (value.presentation) {
                //arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": displayMode\"></span>");
                arr.push("<div class='col-sm-8' data-field=\"" + name + "\"><span class='form-control' data-bind=\"" + value.presentation + ": " + name + ", inRow:false\"></span></div>");
            }
            else {
                arr.push("<div class='col-sm-8' data-field=\"" + name + "\"><span class='form-control' data-bind=\"text: " + name + "\"></span></div>");
            }
            arr.push("</div>")
        }
        //if (ko.isComputed(value))
        //    arr.push(name);
    });

    arr.push("<div class='form-group'>")
    arr.push("   <div class='col-sm-offset-1 col-sm-11'>")
    arr.push("<div class='alert alert-info' style='display:none'><span class='msg'></span><button type='button' class='close' data-dismiss='alert'>&times;</button></div>");
    arr.push("<button type='button' class='btn btn-default' data-bind='click: edit, visible: isViewMode()'>Edit</button>"); // , visible: isViewMode
    arr.push("<button type='button' class='btn btn-danger' data-bind='click: remove, visible: isViewMode()'>Delete</button>"); // , visible: isDelete
    arr.push('   </div>')
    arr.push('</div>')

    arr.push("</form>");
    return arr.join("\n");
}
 
SLEntity.prototype.generateEditFormTemplate = function () {
    var arr = [];
    var ignoreColumns = this.ignoreColumns;
    arr.push("<form class=\"form-horizontal\" role=\"form\">");
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.formLabel) {
            arr.push("<div class=\"form-group\">");
            arr.push("  <label class='col-sm-3 control-label' for=\"" + name + "\">" + value.formLabel + ":</label>");
            arr.push("  <div class='col-sm-9'>")
            if (value.presentation) {
                //arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": displayMode\"></span>");
                arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": " + name + ", inRow:false\"></span>");
            }
            else {
                arr.push("<input data-field=\"" + name + "\" type=\"text\" class=\"form-control\" id=\"" + name + "\" data-bind=\"value: " + name + ", valueUpdate:'keyup'\" placeholder=\"" + name + "\">");
            }
            arr.push("  </div>")
            arr.push("</div>")
        }
        //if (ko.isComputed(value))
        //    arr.push(name);
    });

    arr.push("<div class='form-group'>")
    arr.push("   <div class='col-sm-offset-3 col-sm-9'>")
    arr.push("   <button type='button' class='btn btn-default' data-bind='click: cancel'>Cancel</button>")
    arr.push("   <button type='button' class='btn btn-primary' data-bind='click: save'>Save changes</button>")
    arr.push('   </div>')
    arr.push('</div>')

    arr.push("</form>");
    return arr.join("\n");
}


SLEntity.prototype.generateEditFormInlineTemplate = function () {
    var arr = [];
    var ignoreColumns = this.ignoreColumns;
    arr.push("<form role=\"form\">");
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.formLabel) {
            arr.push("<div class=\"form-group\">");
            arr.push("  <label for=\"" + name + "\">" + value.formLabel + "</label>");
            if (value.presentation) {
                //arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": displayMode\"></span>");
                arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": " + name + ", inRow:false\"></span>");
            }
            else {
                arr.push("<input data-field=\"" + name + "\" type=\"text\" class=\"form-control\" id=\"" + name + "\" data-bind=\"value: " + name + ", valueUpdate:'keyup'\" placeholder=\"" + name + "\">");
            }
            arr.push("</div>")
        }
        //if (ko.isComputed(value))
        //    arr.push(name);
    });

    arr.push("<button type='button' class='btn btn-default' data-bind='click: cancel'>Cancel</button>")
    arr.push("<button type='button' class='btn btn-primary' data-bind='click: save'>Save changes</button>")

    arr.push("</form>");
    return arr.join("\n");
}



SLEntity.prototype.generateTemplates = function (templateEngine) {
    this.primaryKeyName = this.getPrimaryKeyName();

    this.primaryKeyAsAttr = this.primaryKeyName.toLowerCase()[0] +
                                                this.primaryKeyName.substr(1) + ":" +
                                                this.primaryKeyName;
    var entityName = this.entityName.toLowerCase();
    this.dbFields = this.getDbFields();

    var markup, tplName;
    // ---------------
    // form templates
    // ---------------
    tplName = entityName + "-template";
    markup = this.generateFormTemplate();
    this.templates["View"] = tplName;
    this.templates["Delete"] = tplName;
    templateEngine.addTemplate(tplName, markup);

    tplName = entityName + "-edit-template";
    markup = this.generateEditFormTemplate();
    this.templates["Edit"] = tplName;
    this.templates["Add"] = tplName;
    templateEngine.addTemplate(tplName, markup);

    // --------------
    // row templates
    // --------------
    tplName = entityName + "-row-template";
    markup = this.generateRowTemplate();
    this.templates["rowView"] = tplName;
    templateEngine.addTemplate(tplName, markup);

    tplName = entityName + "-row-edit-template";
    markup = this.generateEditRowTemplate();
    this.templates["rowEdit"] = tplName;
    this.templates["rowAdd"] = tplName;
    templateEngine.addTemplate(tplName, markup);
}


//SLEntity.prototype.dbFields = [];   // DataBase fields we work with

// TODO use:  primaryKey: true,
SLEntity.prototype.getDbFields = function () { // {personId:PersonId}
    var ignoreColumns = this.ignoreColumns;
    var dbFields = [];
    var self = this;
    $.each(this, function (name, value) {
        if (typeof value != "function")
            return
        // data base fields
        if ($.inArray(name, ignoreColumns) == -1 && value.defaultValue != undefined) {
            dbFields.push(name);
        }
    });
    return dbFields;
}


// TODO use:  primaryKey: true,
SLEntity.prototype.generateRowTemplate = function () { // primaryKeyAsAttr as {personId:PersonId}
    var arr = [];
    arr.push("<tr data-bind=\"attr:{" + this.primaryKeyAsAttr + ", 'data-index': $index }, css : { oddRow : $index()%2==0 }\">"); // nth-child()
    var ignoreColumns = this.ignoreColumns;
    var self = this;
    var nColumns = 0;
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.headerText != undefined) {
            arr.push("<td>");
            nColumns++;
            if (value.presentation) {
                arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": " + name + ", inRow:true\"></span>");
            }
            else {
                arr.push("<span data-field=\"" + name + "\" data-bind=\"text: " + name + "\"></span>");
            }
            arr.push("</td>")
        }
    });
    arr.push("</tr>");
    arr.push("<tr class='row2' data-bind=\"visible: row2IsVisible, attr:{'data-index': $index }, css : { oddRow : $index()%2==0 }\">");
    arr.push("<td style='overflow:visible; padding: 5px 5px 5px 20px;border-top-width:0px !important' colspan='" + nColumns + "'><div></div></td>");
    arr.push("</tr>");
    return arr.join("\n");
}


SLEntity.prototype.getPrimaryKeyName = function () {
    // for the time being pkey is single field
    var pKey = ""
    var ignoreColumns = this.ignoreColumns;
    var self = this;
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns)) {
            if (value.primaryKey) {
                pKey = name;
                return false; // break
            }
        }
    });
    return pKey;
}



SLEntity.prototype.generateEditRowTemplate = function () { // {personId:PersonId}
    var arr = [];
    arr.push("<tr data-bind=\"attr:{" + this.primaryKeyAsAttr + "}\">");
    var ignoreColumns = this.ignoreColumns;
    var self = this;
    $.each(this, function (name, value) {
        
        if ($.inArray(name, ignoreColumns) == -1 && value.headerText != undefined) {
            arr.push("<td>");
            if (value.primaryKey) {
                if (value.presentation) {
                    arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": " + name + ", inRow:true\"></span>");
                }
                else {
                    arr.push("<span data-field=\"" + name + "\" data-bind=\"text: " + name + ", visible: " + name + "() !=0 && " + name + "() !=''\"></span>"); // isNew
                }
            }
            else {
                if (value.presentation) { //&& $.inArray(name, ["viewForm", "editForm", "deleteForm"]) != -1
                    //arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": { name:'" + name + "'}\"></span>");
                    //arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": rowDisplayMode\"></span>");
                    arr.push("<span data-field=\"" + name + "\" data-bind=\"" + value.presentation + ": " + name + ", inRow:true" + (value.readOnly?',readOnly:true':'') + "\"></span>");
                }
                else {
                    // force presentation for all
                    var pKey = value.primaryKey;
                    if (value.readOnly)
                        arr.push("<span data-field=\"" + name + "\" data-bind=\"text: " + name + "\"></span>");
                    else
                        arr.push("<input class=\"form-control\" data-field=\"" + name + "\" data-bind=\"value: " + name + ", valueUpdate:'keyup'" + (pKey ? ", enable:isRowEditMode" : "") + "\"></input>");
                }
            }
            arr.push("</td>")
        }
    });
    arr.push("</tr>");
    return arr.join("\n");
}

SLEntity.prototype.defaultData = function (viewModel) {
    var defaultData = {};
    var ignoreColumns = this.ignoreColumns;
    $.each(this, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.defaultValue != undefined) {
            defaultData[name] = typeof value.defaultValue == "function" ? $.proxy(value.defaultValue, viewModel)() : value.defaultValue;
        }
    });
    return defaultData;
}

/*
SLEntity.prototype.getFields = function () {
    var ignoreColumns = this.ignoreColumns;
    var fields = []
    $.each(this.__proto__, function (name, value) {
        if ($.inArray(name, ignoreColumns) == -1 && value.defaultValue != undefined) {
            fields.push(name)
        }
    });
    return fields;
}
*/


SLEntity.prototype.getData = function () {
    var data = {};
    var includes = this.dbFields;
    //data = ko.mapping.toJSON(that, { 'include': includes })
    var that = this;
    $.each(this, function (name, value) {
        if ($.inArray(name, includes) != -1) {
            data[name] = ko.unwrap(that[name]);
            if (data[name]) //if it's not null value
            if (typeof data[name] == "object" && data[name].getMonth != undefined)  // Date
                data[name] = data[name].toISOString();
        }
    });
    return data;
}

SLEntity.prototype.takeSnapshot = function () {
    var data = {};
    var includes = this.dbFields;
    //data = ko.mapping.toJSON(that, { 'include': includes })
    var that = this;
    $.each(this, function (name, value) {
        if ($.inArray(name, includes) != -1) {
            data[name] = ko.unwrap(that[name]);
        }
    });
    this.valuesBeforeEdit =  JSON.stringify(data);
}

SLEntity.prototype.isModified = function () {
    var was = this.valuesBeforeEdit
    this.takeSnapshot();
    return this.valuesBeforeEdit != was;
}

SLEntity.prototype.rowEditClick = function () {
    if (this.rowDisplayMode() == "rowEdit" || this.rowDisplayMode() == "rowAdd") {
        if (this.isModified())
            this.onRowEditEnd()
        this.rowDisplayMode("rowView");
    }
    else {
        this.takeSnapshot();
        this.rowDisplayMode("rowEdit");
    }
}


SLEntity.prototype.rowEditCancel = function () {
    if (this.rowDisplayMode() == "rowEdit" || this.rowDisplayMode() == "rowAdd") {
        this.rowDisplayMode("rowView");
    }
    else {
        this.takeSnapshot();
        this.rowDisplayMode("rowEdit");
    }
}



//
SLEntity.prototype.isEditable = ko.observable(true);
//SLEntity.prototype.isRowEdit = ko.observable(false);
SLEntity.prototype.isPopoverShown = ko.observable(false);

// when popover with edit form is shown, can't check 'edit row' of editing row
SLEntity.prototype.isRowEditable = ko.computed(function () {
    return SLEntity.prototype.isEditable() && !SLEntity.prototype.isPopoverShown()
}, this);

SLEntity.prototype.valuesBeforeEdit = null;

SLEntity.prototype.serialize = function () {
    return ko.mapping.toJSON(this, { 'ignore': this.getIgnores() })
}


// sredi 
SLEntity.prototype.isDelete = ko.observable(false);

//SLEntity.prototype.actionsEnabled = ko.computed(function () {
//    return SLEntity.prototype.isPopoverShown() ? false :
//            SLEntity.prototype.isNew ? true :
//                SLEntity.prototype.gridViewModel == null || !SLEntity.prototype.gridViewModel.isAdding();

//}, SLEntity.prototype);


    SLEntity.prototype.getForm = function () { // TODO need testing
        var primaryKeyName = this.getPrimaryKeyName();
        return document.getElementById(this.entityName.toLowerCase() +  '-form-' + this[primaryKeyName]())
    }

    SLEntity.prototype.cleanNode = function () {
        ko.cleanNode(this.getForm());
    }

    SLEntity.prototype.renderEditTemplate = function (elem, e) {
        this.valuesBeforeEdit = this.serialize();
        this.popoverElem = elem;
        /*
        // apply Person as the ViewModel to person-form
        // ko.applyBindings(self, self.getForm());  // events remain with ko.cleanNode 
        ko.renderTemplate("EditPersonTemplate", this, { afterRender: this.afterRenderForm }, elem, "replaceChildren");  // this.getForm()
        */
        // TODO memory leak
        ko.applyBindings(this, $(elem).data('bs.popover').tip()[0]);
        /*
        //this.afterRenderForm();
        if (this.displayMode() != "Edit")
            this.displayMode("Edit");
        if (e)
            e.stopPropagation();  // View=>Edit
        */
    }

    SLEntity.prototype.renderViewTemplate = function (elem, e) {
        // apply Person as the ViewModel to person-form
        // ko.applyBindings(self, self.getForm()); // events remain with ko.cleanNode 
        /*
        ko.renderTemplate("PersonTemplate", this, {}, this.getForm(), "replaceChildren");
        */
        // TODO memory leak
        this.popoverElem = elem;
        ko.applyBindings(this, $(elem).data('bs.popover').tip()[0]);
        //this.afterRenderForm();

        //var mode = isDeleteForm ? "Delete" : "View";
        //this.displayMode(mode);
        if (e)
            e.stopPropagation();  // View=>Edit
    }

    SLEntity.prototype.afterRenderForm = function (elems, vm) {
        $.each(elems, function (i, el) {
            if (el.tagName == "FORM") {
                var pos = self.pos;
                //var popover = this.getPopover();
                //if (self.placement == "bottom")
                //    popover.css('left', pos.left - ((popover.outerWidth() - pos.width) / 2) + "px");
                //else {
                //    popover.css('left', pos.left - ((popover.outerWidth() - pos.width) / 2) + "px");
                //    popover.css('top', pos.top - ((popover.outerHeight() - pos.height)) + "px");
                //}
            }
        });
    }

    SLEntity.prototype.cancel = function (data, e, f) {
        //if (self.valuesBeforeEdit != self.serialize())
        //    prompt("Are you sure to discard changes?")
        ko.mapping.fromJSON(this.valuesBeforeEdit, {
            key: function (person) {
                return ko.utils.unwrapObservable(person.PersonId);
            }
        }, this);
        $('.edit-entity.popoverShown').popover('hide');
    }

    SLEntity.prototype.save = function (data, e) {
        this.store();
        $('.edit-entity.popoverShown').popover('hide');
    }

    SLEntity.prototype.store = function () {
        var data = this.getData()
        if (this.isNew()) {
            this.gridViewModel.store(data);
            this.isNew(false)
        } else {
            this.gridViewModel.update(data);
        }
    }

    SLEntity.prototype.onRowEditEnd = function () {
        this.store();
    }

    SLEntity.prototype.edit = function (data, e, f) {
        //var personId = this.PersonId();
        //var person = $.grep(this.gridViewModel.itemsAtPage(), function (p) { return p.PersonId() == personId });
        e.stopPropagation();
        this.displayMode("Edit");
        /*
        return
        //if (self.valuesBeforeEdit != self.serialize())
        //    prompt("Are you sure to discard changes?")
        ko.mapping.fromJSON(this.valuesBeforeEdit, {
        key: function (person) {
        return ko.utils.unwrapObservable(person.PersonId);
        }
        }, this);
        $('.edit-entity.popoverShown').popover('hide');
        */
    }

    SLEntity.prototype.remove = function (data, e, f) {
        if (e)
            e.stopPropagation();
        if (this.isNew()) {  // yet no stored
            //  a call from addRow
            this.gridViewModel.onItemRemoved(this);
        }
        else
            this.gridViewModel.remove(this); // callBack is onDeleted
        /*
        return
        //if (self.valuesBeforeEdit != self.serialize())
        //    prompt("Are you sure to discard changes?")
        ko.mapping.fromJSON(this.valuesBeforeEdit, {
        key: function (person) {
        return ko.utils.unwrapObservable(person.PersonId);
        }
        }, this);
        $('.edit-entity.popoverShown').popover('hide');
        */
    }

    SLEntity.prototype.getPopover = function () {
        return $(this.popoverElem).data('bs.popover').tip();
    }

    SLEntity.prototype.setAlert = function (msg) {
        this.getPopover().find("div.alert").show('slow').end().find("span.msg").html(msg);
    }

    SLEntity.prototype.onDeleted = function (status, message) {
        if (status != "ok") {
            if (this.popoverElem)
                this.setAlert(status);
            else
                alert(status);
            return;
        }

        if (this.popoverElem) {
            this.setAlert("Removed !");

            var that = this;
            setTimeout(function () {
                // popover has to be hidden before table row is removed 
                that.getPopover().find(".close").trigger('click');
                //$(that.popoverElem).popover('hide');
                that.gridViewModel.onItemRemoved(that);
            }, 2000);
        }
        else {
            alert('removed');
            this.gridViewModel.onItemRemoved(this);
        }
    }



    SLEntity.prototype.whichTpl4Row = function () {
        return this.templates[this.rowDisplayMode()];
    }

    SLEntity.prototype.whichTpl = function (that) {
        return that.templates[that.displayMode()];
    }


    SLEntity.prototype.row2IsVisible = ko.observable(false);
    SLEntity.prototype.row2EverShown = ko.observable(false);


function DBEntity() {
    var self = this;
    var orderByColumn;

    this.SortingString = function (a, b) {
        var aVal = a[orderByColumn].toLowerCase();
        var bVal = b[orderByColumn].toLowerCase();
        return ((aVal < bVal) ? -1 : ((aVal > bVal) ? 1 : 0));
    }

    this.SortingStringDesc = function (a, b) {
        return self.SortingString(b, a);
    }


    this.SortingNum = function (a, b) {
        var aVal = a[orderByColumn];
        var bVal = b[orderByColumn];
        return ((aVal < bVal) ? -1 : ((aVal > bVal) ? 1 : 0));
    }

    this.SortingNumDesc = function (a, b) {
        return self.SortingNum(b, a);
    }


    this.Sorting = function (a, b) {
        var aVal = a[orderByColumn].toString();
        var bVal = b[orderByColumn].toString();
        return ((aVal < bVal) ? -1 : ((aVal > bVal) ? 1 : 0));
    }

    this.SortingDesc = function (a, b) {
        return !self.Sorting(b, a);
    }


    this.Callback = null;
    this.Start = 0;
    this.End = 0;
    this.MaxPageIndex = 0;

    // This method is for in memory sets.
    // To get data from the server
    // override this method and subscribe to server using real-time data streamer  or 
    // ajax call using OData Protocol like this:  http://...?$top=20&$skip=10&filter ...

    this.Subscribe = function (query, callBack) {
        this.ItemsFiltered = this.Items;
        this.Start = (query.page - 1) * query.pageSize;
        this.End = this.Start + query.pageSize;
        this.MaxPageIndex = Math.ceil(this.ItemsFiltered.length / query.pageSize) - 1;
        this.SortBy(query.orderBy, query.asc);
        var set = this.ItemsFiltered.slice(this.Start, this.End);
        callBack(set, this.MaxPageIndex, this.ItemsFiltered.length)
    }


    this.SortBy = function (column, asc) {
        orderByColumn = column;
        if (this.ItemsFiltered.length == 0)
            return;
        switch (typeof this.ItemsFiltered[0][column]) {
            case "string":
                this.ItemsFiltered.sort(asc ? this.SortingString : this.SortingStringDesc);
                break;
            case "number":
                this.ItemsFiltered.sort(asc ? this.SortingNum : this.SortingNumDesc);
                break;
            default:
                this.ItemsFiltered.sort(asc ? this.Sorting : this.SortingDesc);
        }
    }


}
