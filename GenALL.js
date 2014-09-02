
// -------------------
// Entity
// -------------------

function Entity(data) { //name, text, isActive, items) {
    this.name = data.Name;
    this.id = data.Name.getId() + Entity.prototype.uniqueId++;
    this.text = data.Text;
    this.isActive = typeof data.IsActive != 'undefined' ? data.IsActive : false;
    this.lowerCase = this.name.toLowerCase();
    this.items = data.Items;
}

Entity.prototype.uniqueId = 1001;


// -------------------
// EntityTab
// -------------------

function EntityTab(viewModel, entity) {
    var self = this;
    self.viewModel = viewModel;
    self.entityName = ko.observable(entity.name);
    self.entityId = entity.id;
    self.entityText = ko.observable(entity.text);
    self.entityText.subscribe(function (val) {
        self.entityName(val);
    });
    self.isActive = ko.observable(entity.isActive);
    self.paneWidth = 0;
    self.paneHeight = 0;

    self.editing = ko.observable(false);
    self.setEditing = function () { self.editing(true) }

    var x = new EntityFieldList(new EntityFieldDB(entity.lowerCase + "_EntityFieldDB", entity.items));
    self.entityFieldListViewModel = x.viewModel;

    self.loaded = ko.observable(false);

    self.deActivate = function () {
        self.isActive(false);
    }

    self.Activate = function () {
        self.isActive(true);
    }

    self.clean = function () {
    }

    self.onPaneResize = function (innerWidth, height) {
        self.paneWidth = innerWidth - 20;
        self.paneHeight = height;
    }


    self.removeTab = function (a, e) {
        self.viewModel.removeTab(a.entityId, self.isActive());
    }

}
/////////////////////////////////////
//   DataType

function DropDownDataType() {

    this.getItems = function (filter, outItems) {
        outItems( 
            $.grep(this.Items, function (a) {
                return filter == "" || a.Name.indexOf(filter) == 0
            })
        )
    }

}

DropDownDataType.prototype.Items = [
        { Id: "string", Name: "string" },
        { Id: "bit", Name: "bit" },
        { Id: "int", Name: "int" },
        { Id: "long", Name: "long" },
        { Id: "float", Name: "float" },
        { Id: "double", Name: "double" },
        { Id: "datetime", Name: "datetime" }
    ];

DropDownDataType.prototype.getItem = function (id) {
    var arr = $.grep(this.Items, function (a) { return a.Id == id });
    if (arr.length != 1)
        alert("DropDownDateType, found " + arr.length + " items for Id:" + id)
    return arr[0]
}


DropDownDataType.prototype.viewTemplateName = "view-datatype-select-template";
DropDownDataType.prototype.editTemplateName = "edit-datatype-select-template";


DropDownDataType.prototype.viewMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenDataType -->\
                <span data-bind='text: chosenDataType().Name'></span>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenDataType -->\
                <span class='form-control'></span>\
            <!-- /ko -->\
    </div>";


DropDownDataType.prototype.editMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenDataType -->\
            <input type='text' class='form-control' data-bind='value: chosenDataType().Name'>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenDataType -->\
            <input type='text' class='form-control'>\
            <!-- /ko -->\
            <div class='input-group-btn dropdown'>\
                <button type='button' class='btn btn-default dropdown-toggle' id=\"dropdownMenu1\" data-toggle='dropdown'>\
                    <span class='caret'></span>\
                </button>\
                <ul class=\"dropdown-menu pull-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\"  style='max-height: 200px;min-width:60px;overflow-y:auto' data-bind=\"foreach: datatypeItems\">\
                    <li><a href='#' data-bind=\"attr: { 'data-id': Id }, text: Name, click: $parent.datatypeItemChange\"></a></li>\
                </ul>\
            </div>\
    </div>";



DropDownDataType.prototype.generateTemplates = function (templateEngine) {
    templateEngine.addTemplate(this.viewTemplateName, this.viewMarkup);
    templateEngine.addTemplate(this.editTemplateName, this.editMarkup);
}



// -------------------
// bsDropDownDataType
// -------------------

ko.bindingHandlers.bsDropDownDataType = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var mode = viewModel.rowDisplayMode()
        var inRow = allBindings.get("inRow");

        var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
        var tpl = isViewMode ? DropDownDataType.prototype.viewTemplateName : DropDownDataType.prototype.editTemplateName;

        if ($("#" + tpl).length == 0)
            alert("missing call DropDownDataType.prototype.generateTemplates(templateEngine)")

        $(element).html($("#" + tpl).html())

        if (isViewMode) {
        }
        else {
            if (viewModel.datatypeItems == undefined) {
                viewModel.datatypeItems = ko.observableArray([])
                viewModel.dropDownDataType = new DropDownDataType();
                viewModel.dropDownDataType.getItems("", viewModel.datatypeItems);
                viewModel.datatypeItemChange = function (datatype, event) {
                    viewModel.DataTypeId(datatype.Id);
                }
            }

            $(element).find('input').attr('readonly', 'readonly');
        }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
}
/////////////////////////////////////
//   Presentation

function DropDownPresentation() {

    this.getItems = function (filter, outItems) {
        outItems(
            $.grep(this.Items, function (a) {
            return filter == "" || a.Name.indexOf(filter) == 0
            })
        )
    }
}


DropDownPresentation.prototype.Items = [
        { Id: "Default", Name: "Default" },
        { Id: "DropDown", Name: "DropDown" },
        { Id: "Typeahead", Name: "Typeahead" }
    ];

DropDownPresentation.prototype.getItem = function (id) {
    var arr = $.grep(this.Items, function (a) { return a.Id == id });
    if (arr.length != 1)
        alert("DropDownPresentation, found " + arr.length + " items for Id:" + id)
    return arr[0]
}

DropDownPresentation.prototype.viewTemplateName = "view-presentation-select-template";
DropDownPresentation.prototype.editTemplateName = "edit-presentation-select-template";


DropDownPresentation.prototype.viewMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenPresentation -->\
                <span data-bind='text: chosenPresentation().Name'></span>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenPresentation -->\
                <span class='form-control'></span>\
            <!-- /ko -->\
    </div>";


DropDownPresentation.prototype.editMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenPresentation -->\
            <input type='text' class='form-control' data-bind='value: chosenPresentation().Name'>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenPresentation -->\
            <input type='text' class='form-control'>\
            <!-- /ko -->\
            <div class='input-group-btn dropdown'>\
                <button type='button' class='btn btn-default dropdown-toggle' id=\"dropdownMenu1\" data-toggle='dropdown'>\
                    <span class='caret'></span>\
                </button>\
                <ul class=\"dropdown-menu pull-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\"  style='max-height: 200px;min-width:60px;overflow-y:auto' data-bind=\"foreach: presentationItems\">\
                    <li><a href='#' data-bind=\"attr: { 'data-id': Id }, text: Name, click: $parent.presentationItemChange\"></a></li>\
                </ul>\
            </div>\
    </div>";



DropDownPresentation.prototype.generateTemplates = function (templateEngine) {
    templateEngine.addTemplate(this.viewTemplateName, this.viewMarkup);
    templateEngine.addTemplate(this.editTemplateName, this.editMarkup);
}



// -----------------------
// bsDropDownPresentation
// -----------------------

ko.bindingHandlers.bsDropDownPresentation = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var mode = viewModel.rowDisplayMode()
        var inRow = allBindings.get("inRow");

        var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
        var tpl = isViewMode ? DropDownPresentation.prototype.viewTemplateName : DropDownPresentation.prototype.editTemplateName;

        if ($("#" + tpl).length == 0)
            alert("missing call DropDownPresentation.prototype.generateTemplates(templateEngine)")
       
        $(element).html($("#" + tpl).html())

        if (isViewMode) {
        }
        else {
            if (viewModel.presentationItems == undefined) {
                viewModel.presentationItems = ko.observableArray([])
                viewModel.dropDownPresentation = new DropDownPresentation();
                viewModel.dropDownPresentation.getItems("", viewModel.presentationItems);
                viewModel.presentationItemChange = function (presentation, event) {
                    viewModel.PresentationId(presentation.Id);
                }
            }

            $(element).find('input').attr('readonly', 'readonly');
        }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
}


// ------------------------------
//  EntityField EXTENDS SLEntity
// ------------------------------

var EntityField = function (data, gridViewModel) {
    var self = this;
    this.gridViewModel = gridViewModel; // the same as FieldList.viewModel

    this.FieldId = ko.observable(data.FieldId || 0)
    this.Name = ko.observable(data.Name || "")
    this.PrimaryKey = ko.observable(data.PrimaryKey === undefined ? false : data.PrimaryKey)

    // we keep DataType in db
    this.DataTypeId = ko.observable(data.DataTypeId === undefined ? data.DataType /*EntityField.prototype.DataTypeId.defaultValue*/ : data.DataTypeId)
    this.chosenDataType = ko.computed(function () {
        return DropDownDataType.prototype.getItem(this.DataTypeId())
    }, this);
    
    this.DefaultValue = ko.observable(data.DefaultValue === undefined ? EntityField.prototype.DefaultValue.defaultValue : data.DefaultValue)

    // we keep Presentation in db
    this.PresentationId = ko.observable(data.Presentation === undefined ? EntityField.prototype.PresentationId.defaultValue : data.Presentation)
    this.chosenPresentation = ko.computed(function () {
        return DropDownPresentation.prototype.getItem(this.PresentationId())
    }, this);

    //this.ForeignKeyId = ko.observable(data.ForeignKeyId === undefined ? EntityField.prototype.ForeignKeyId.defaultValue : data.ForeignKeyId)
    //this.chosenForeignKey = ko.computed(function () {
    //    return ForeignKeyList.getForeignKey(this.ForeignKeyId())
    //}, this);
    this.ForeignKey = ko.observable(data.ForeignKey === undefined ? EntityField.prototype.ForeignKey.defaultValue : data.ForeignKey)

    this.isNew = ko.observable(data.isNew || false);
    this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : EntityField.DEFAULTS.rowDisplayMode);
}

EntityField.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
        placement: "right",
        rowDisplayMode: "rowView"
    })

EntityField.prototype = new SLEntity();

EntityField.prototype.getDefaults = function () {
return EntityField.DEFAULTS
}

EntityField.prototype.entityName = "EntityField";

EntityField.prototype.FieldId = ko.observable(0)
            .extend({
                primaryKey: true,
                headerText: "Id",
                formLabel: "Id",
                width: "100px",
                defaultValue: function () { return this.getNextId() }
            });

EntityField.prototype.Name = ko.observable("")
    .extend({
        headerText: "Name",
        formLabel: "Name",
        presentation: "bsPopoverLink", // view form
        width: "200px",
        defaultValue: "",
        required: true,
        minLength: 2,
        pattern: { message: 'Please, start with uppercase !', params: '^([A-Z])+' }
    });

 EntityField.prototype.PrimaryKey = ko.observable("")
    .extend({
        headerText: "Primary Key",
        formLabel: "Primary Key",
        presentation: "bsCheckbox", // view form
        sortable: false,
        width: "80px",
        defaultValue: "",
        required: true
    });

// DataType
EntityField.prototype.DataTypeId = ko.observable(0)
.extend({
    defaultValue: "string"
});

EntityField.prototype.chosenDataType = ko.observable()
.extend({
    sortable: false,
    headerText: "Data Type",
    formLabel: "Data Type",
    width: "100px",
    presentation: "bsDropDownDataType"
});

// DefaultValue
EntityField.prototype.DefaultValue = ko.observable("")
.extend({
    headerText: "Default",
    formLabel: "Default",
    sortable: false,
    width: "100px",
    defaultValue: ""
});


// Presentation
EntityField.prototype.PresentationId = ko.observable(0)
.extend({
    defaultValue: "Default"
});

EntityField.prototype.chosenPresentation = ko.observable()
.extend({
    headerText: "Presentation",
    formLabel: "Presentation",
    sortable: false,
    width: "100px",
    presentation: "bsDropDownPresentation"
});

// ForeignKey
/*
EntityField.prototype.ForeignKeyId = ko.observable(0)
.extend({
    defaultValue: undefined
});

EntityField.prototype.chosenForeignKey = ko.observable()
.extend({
    headerText: "Foreign Key",
    formLabel: "Foreign Key",
    width: "200px",
    presentation: "bsSelectForeignKey"
});
*/

EntityField.prototype.ForeignKey = ko.observable(0)
.extend({
    headerText: "Foreign Key",
    formLabel: "Foreign Key",
    sortable: false,
    //width: "200px", last column will expand
    defaultValue: undefined
});



/*EntityField.prototype.viewForm = ko.observable("")
.extend({
headerText: "View",
sortable: false,
width: "50px",
presentation: "bsPopoverLink"
});*/

EntityField.prototype.editRow = ko.observable("")
    .extend({
        headerText: "Edit",
        sortable: false,
        width: "50px",
        presentation: "bsRowEditLink"
    });


EntityField.prototype.deleteRow = ko.observable("")
    .extend({
        headerText: "Delete",
        sortable: false,
        width: "50px",
        presentation: "bsRowDeleteLink"
    });
/*
EntityField.prototype.editForm = ko.observable("")
    .extend({
        headerText: "Edit",
        sortable: false,
        width: "50px",
        presentation: "bsPopoverLink"
    });

EntityField.prototype.deleteForm = ko.observable("")
    .extend({
        headerText: "Delete",
        sortable: false,
        width: "50px",
        presentation: "bsPopoverLink"
    });
*/

EntityField.prototype.placement = "bottom";

EntityField.prototype.getForm = function () {
    return document.getElementById('entity-form-' + this.FieldId())
}

EntityField.prototype.cleanNode = function () {
    ko.cleanNode(this.getForm());
}

EntityField.prototype.renderEditTemplate = function (elem, e) {
    this.valuesBeforeEdit = this.serialize();
    this.popoverElem = elem;
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

EntityField.prototype.renderViewTemplate = function (elem, e) {
    // TODO memory leak
    this.popoverElem = elem;
    ko.applyBindings(this, $(elem).data('bs.popover').tip()[0]);
    //this.afterRenderForm();

    //var mode = isDeleteForm ? "Delete" : "View";
    //this.displayMode(mode);
    if (e)
        e.stopPropagation();  // View=>Edit
}

EntityField.prototype.afterRenderForm = function (elems, vm) {
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

EntityField.prototype.cancel = function (data, e, f) {
    //if (self.valuesBeforeEdit != self.serialize())
    //    prompt("Are you sure to discard changes?")
    ko.mapping.fromJSON(this.valuesBeforeEdit, {
        key: function (entity) {
            return ko.utils.unwrapObservable(entity.FieldId);
        }
    }, this);
    $('.edit-entity.popoverShown').popover('hide');
}

EntityField.prototype.save = function (data, e) {
    this.store();
    $('.edit-entity.popoverShown').popover('hide');
}

EntityField.prototype.store = function () {
    var data = this.getData()
    if (this.isNew()) {
        this.gridViewModel.storeEntityField(data);
        this.isNew(false)
    } else {
        this.gridViewModel.updateEntityField(data);
    }
}

EntityField.prototype.onRowEditEnd = function () {
    this.store();
}

EntityField.prototype.edit = function (data, e, f) {
    //var entityId = this.FieldId();
    //var entity = $.grep(this.entityFieldList.viewModel.itemsAtPage(), function (p) { return p.FieldId() == personId });
    e.stopPropagation();
    this.displayMode("Edit");
    /*
    return
    //if (self.valuesBeforeEdit != self.serialize())
    //    prompt("Are you sure to discard changes?")
    ko.mapping.fromJSON(this.valuesBeforeEdit, {
    key: function (person) {
    return ko.utils.unwrapObservable(person.FieldId);
    }
    }, this);
    $('.edit-entity.popoverShown').popover('hide');
    */
}

EntityField.prototype.remove = function (data, e, f) {
    if (e)
        e.stopPropagation();
    if (this.isNew()) {  // yet no stored
        //  a call from addRow
        this.gridViewModel.onItemRemoved(this);
    }
    else
        this.gridViewModel.deleteEntityField(this); // callBack is onDeleted
    /*
    return
    //if (self.valuesBeforeEdit != self.serialize())
    //    prompt("Are you sure to discard changes?")
    ko.mapping.fromJSON(this.valuesBeforeEdit, {
    key: function (person) {
    return ko.utils.unwrapObservable(person.FieldId);
    }
    }, this);
    $('.edit-entity.popoverShown').popover('hide');
    */
}

EntityField.prototype.getPopover = function () {
    return $(this.popoverElem).data('bs.popover').tip();
}

EntityField.prototype.setAlert = function (msg) {
    this.getPopover().find("div.alert").show('slow').end().find("span.msg").html(msg);
}

EntityField.prototype.onDeleted = function (status, message) {
    if (this.popoverElem) {
        if (status == "ok") {
            this.setAlert("Removed !");
        }
        else {
            this.setAlert(message);
        }

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

EntityField.prototype.templates = {}

EntityField.prototype.whichTpl4Row = function () {
    return this.templates[this.rowDisplayMode()];
}

EntityField.prototype.whichTpl = function (that) {
    return that.templates[that.displayMode()];
}

       



function EntityFieldDB(entityName, items) {

    this.entityName = "EntityFieldDB";

    this.Items = items || [];

    // override DBEntity.Subscribe
    this.Subscribe = function (query, callBack) {
        var items = this.Items;
        if (query.filter != "") {
            var part = query.filter.split(',');
            if (part.length == 0) {
                var filter = query.filter.toLowerCase();
                items = $.grep(items, function (p) {
                    return  p.Name.toLowerCase().indexOf(filter) == 0 ||
                            p.TwitterName.toLowerCase().indexOf(filter) == 0
                });
            }
            else {
                items = $.grep(items, function (p) {
                    return p.Name == part[0] && p.TwitterName == $.trim(part[1])
                });
            }
        }
        //if (this.Items.length > 0) {

        this.Start = (query.page - 1) * query.pageSize;
        this.End = this.Start + query.pageSize;
        this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
        this.SortBy(query.orderBy, query.asc);
        var set = items.slice(this.Start, this.End);
     
        callBack(set, this.MaxPageIndex, this.Items.length)
    }

    this.GetMaxId = function () {
        var arr = this.Items.map(function (data, i) {
            return data.FieldId;
        });
        if (arr.length == 0)
            return 0;
        return Math.max.apply(null, arr);
    }

    this.GetEntityField = function (fieldId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.FieldId == fieldId;
        });
        return null;
    }

    this.UpdateEntityField = function (data) {
        var entityField = this.GetEntityField(data.FieldId);
        $.each(entityField, function (name, value) {
            entityField[name] = data[name];
        });
    }

    this.StoreEntityField = function (data) {
        this.Items.push(data)
    }

    this.DeleteEntityField = function (entity) {
        var data = this.GetEntityField(entity.FieldId());
        this.Items.splice($.inArray(data, this.Items), 1);
        setTimeout(function () { entity.onDeleted("ok", "deleted") }, 100);
    }

};

EntityFieldDB.prototype = new DBEntity();
// instantiated at FieldList
//var EntityFieldDB = new EntityFieldDB();


/////////////////////////////////////
//   EntityFieldList

function EntityFieldList(DB)  {

    var db = DB,
        PageSize = 5,
        Page = 1,
        Filter = "",
        OrderByColumn = "FieldId",
        Asc = true;

    var self = this;
    var listFilter = null;
    
    this.setListFilter = function(lf) {
        listFilter = lf;
    }

    var Subscribe = function (filter) {
        var query = {
            filter: Filter || "",
            page: Page,
            pageSize: PageSize,
            orderBy: OrderByColumn,
            asc: Asc
        };
        db.Subscribe(query, PushInitialSet);
    }

    var PushInitialSet = function (set, maxPageIndex, nItems) {
        ko.mapping.fromJS(set, {
            key: function (entityField) {
                return ko.utils.unwrapObservable(entityField.FieldId);
            },
            create: function (options) {
                return new EntityField(options.data, self.viewModel);
            }
        }, self.viewModel.itemsAtPage);
        self.viewModel.nItems(nItems);
        self.viewModel.maxPageIndex(maxPageIndex);
    }

    var PushUpdates = function () {
    }

    this.getDB = function () {
        return db;
    }

    var GetEntityField = function (id) {
        return ko.utils.arrayFirst(self.viewModel.items(), function (p) { // grep
            return p.FieldId() == id;
        });
    }

    var StoreEntityField = function (data) {   db.StoreEntityField(data) }
    var UpdateEntityField = function (data) {  db.UpdateEntityField(data) }
    var DeleteEntityField = function (entityField) { db.DeleteEntityField(entityField) }

    var GetNextId = function () {
        return db.GetMaxId() + 1;
    }

    function GridViewModel() {
        var self = this;

        // call from SLGrid.init()
        this.Subscribe = function (page) {
            if (page != undefined)
                Page = page;
            Subscribe();
        }

        this.SubscribeFilter = function (filter) {
            if (filter != undefined)
                Filter = filter;
            Subscribe();
        }


        //this.orderByColumn = function () { return OrderByColumn }
        this.OrderBy = function (column, asc) {
            OrderByColumn = column;
            Asc = asc;
            Subscribe();
        }

        this.GetItem = function (id) {
            return ko.utils.arrayFirst(ViewModel.itemsAtPage(), function (p) { // grep
                return p.FieldId() == id;
            });
        }

        

        this.updateEntityField = function (entityField) {
            UpdateEntityField(entityField)
        }

        this.storeEntityField = function (entityField) {
            StoreEntityField(entityField)
        }
        
        this.deleteEntityField = function (entityField) {
            DeleteEntityField(entityField)
        }

        this.onItemRemoved = function (entityField) {
            //entityField.onRemove();
            this.itemsAtPage.remove(entityField);
            if (entityField.isNew)
                this.isAdding(false);
        }

        this.canAddField = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this);

        this.whichTpl4Row = function (entityField) {
            return entityField.whichTpl4Row();
        }

        this.afterRender = function (elems, z) {
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, entityField) {
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }

        this.addField = function () {
            var data = EntityField.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var set = [data];
            var arr = ko.observableArray([]);
            ko.mapping.fromJS(set, {
                key: function (entityField) {
                    return ko.utils.unwrapObservable(entityField.FieldId);
                },
                create: function (options) {
                    return new EntityField(options.data, self);//self.viewModel);
                }
            }, arr);
            this.itemsAtPage.push(arr()[0]);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        listTpl: {
            listHeader: "Entities",
            textAdd: "Add Entity",
            textPager: "Entities",
            filterInputId: ""
        },
        orderByColumn: OrderByColumn,
        columns: EntityField.prototype.getGridColumns(OrderByColumn)
    })

    this.viewModel = new GridViewModel();
}




//EntityField.prototype.entityFieldList = new EntityFieldList(new EntityFieldDB("EntityFieldDB", personItems));


//EntityFieldList.setListFilter(new EntityFieldListFilter(EntityFieldList));


(function () {

    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    DropDownDataType.prototype.generateTemplates(templateEngine);
    DropDownPresentation.prototype.generateTemplates(templateEngine)
    
    EntityField.prototype.generateTemplates(templateEngine);
})();




