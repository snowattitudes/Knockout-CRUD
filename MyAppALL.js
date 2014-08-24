
function CityDB() {

    this.entityName = "CityDB";

    this.Items = [
            { CityId: 101, Name: "London" },
            { CityId: 102, Name: "Rome" },
            { CityId: 103, Name: "New York" },
            { CityId: 104, Name: "Tokio" },
            { CityId: 105, Name: "Shanghai" },
            { CityId: 106, Name: "Karachi" },
            { CityId: 107, Name: "Beijing" },
            { CityId: 108, Name: "Istanbul" },
            { CityId: 109, Name: "Mumbai" },
            { CityId: 110, Name: "Sao Paulo" },
            { CityId: 111, Name: "Lahore" },
            { CityId: 112, Name: "Delhi" },
            { CityId: 113, Name: "Seoul" },
            { CityId: 114, Name: "Lima" },
            { CityId: 115, Name: "Kinshasa" },
            { CityId: 116, Name: "Tokyo" },
            { CityId: 117, Name: "Cairo" },
            { CityId: 118, Name: "Mexico City" },
            { CityId: 119, Name: "Bangkok" },
            { CityId: 120, Name: "Tehran" },
            { CityId: 121, Name: "Hong Kong" },
            { CityId: 122, Name: "Baghdad" },
            { CityId: 123, Name: "Hanoi" },
            { CityId: 124, Name: "Rio de Janeiro" },
            { CityId: 125, Name: "Santiago" },
            { CityId: 126, Name: "Riyadh" },
            { CityId: 127, Name: "Luanda" },
            { CityId: 128, Name: "Saint Petersburg" },
            { CityId: 129, Name: "Abidjan" },
            { CityId: 130, Name: "Sydney" },
            { CityId: 131, Name: "Alexandria" },
            { CityId: 132, Name: "Kolkata" },
            { CityId: 133, Name: "Johannesburg" },
            { CityId: 134, Name: "Nanjing" },
            { CityId: 135, Name: "Ankara" },
            { CityId: 136, Name: "Melbourne" },
            { CityId: 137, Name: "Giza" },
            { CityId: 138, Name: "Los Angeles" },
            { CityId: 139, Name: "Cape Town" },
            { CityId: 140, Name: "Yokohama" },
            { CityId: 141, Name: "Berlin" },
            { CityId: 142, Name: "Jeddah" },
            { CityId: 143, Name: "Durban" },
            { CityId: 144, Name: "Hefei" },
            { CityId: 145, Name: "Pyongyang" },
            { CityId: 146, Name: "Madrid" },
            { CityId: 147, Name: "Nairobi" },
            { CityId: 148, Name: "Addis Ababa" }
    ];

    this.getItemsForDropDown = function (filter, callBack) {
        var items = $.grep(this.Items, function (city) {
            return filter == "" || city.Name.indexOf(filter) >= 0
        });
        callBack(items.slice());
        /*
        $.ajax({
            url: '/City/CityNames',
            data: { top: 1000, skip: 0, filter: "", orderby: "Name asc" },
            cache: false,
            success: function (data.items) {
                callBack(data.items ? data.items.slice() : []);
            },
            failure: function (response) {
                debugger
            }
        });
        */
    }

    this.getItemById = function (cityId) {
        var arr = $.grep(this.Items, function (a) { return a.CityId == cityId });
        if (arr.length != 1)
            alert("CityDB, found " + arr.length + " items for cityId:" + cityId)
        return arr[0]
    }

    // override DBEntity.Subscribe
        this.Subscribe = function (query, callBack) {
            // subscribe to server, and call pushInitialSet
            this.Callback = callBack;
            this.Start = (query.page - 1) * query.pageSize;
            this.End = this.Start + query.pageSize;

            var that = this;
            $.ajax({
                url: GetCountriesURL,
                data: { top: query.pageSize, skip: this.Start, filter: query.filter, orderby: query.orderBy + (query.asc ? " asc" : " desc") },
                cache: false,
                success: function (data) {
                    //if (data.length > 0)
                    that.Items = data.items;
                    that.MaxPageIndex = Math.ceil(data.nTotalItems / query.pageSize) - 1;
                    that.Callback(that.Items, that.MaxPageIndex);
                    //that.SortBy(query.orderBy, query.asc);
                },
                failure: function (response) {
                    debugger
                }
            });
        }


    this.GetCity = function (cityId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.CityId == cityId;
        });
        return null;
    }

   
};

CityDB.prototype = new DBEntity();

var CityDB = new CityDB();




 
// ---------------------------
//  City extends SLEntity
// ---------------------------

var City = function (data, gridViewModel, element, options) {
        var self = this;
        this.gridViewModel = gridViewModel; // the same as Countries.viewModel

        this.CityId = ko.observable(data.CityId || 0)
        this.Name = ko.observable(data.Name || "")
    }



City.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
    placement: 'right',
    rowDisplayMode: "rowView"
})

City.prototype = new SLEntity();

City.prototype.getDefaults = function () {
    return City.DEFAULTS
}


/////////////////////////////////////
//   City

function DropDownCity() {

    this.getItems = function (filter, outItems) {
        //var dbItems = $.grep(CityDB.Items, function (a) {
        //    return filter == "" || a.Name.indexOf(filter) == 0
        //});
        CityDB.getItemsForDropDown(filter, 
                function (set) {
                    ko.mapping.fromJS(set, {
                        key: function (city) {
                            return ko.utils.unwrapObservable(city.CityId);
                        },
                        create: function (options) {
                            return new City(options.data, null);
                        }
                    }, outItems);
                }
        );
    }

}

DropDownCity.prototype.viewTemplateName = "view-city-select-template";
DropDownCity.prototype.editTemplateName = "edit-city-select-template";


DropDownCity.prototype.viewMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenCity -->\
                <span data-bind='text: chosenCity().Name'></span>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenCity -->\
                <span class='form-control'></span>\
            <!-- /ko -->\
    </div>";


DropDownCity.prototype.editMarkup = 
    "<div class='input-group'>\
            <!-- ko if: chosenCity -->\
            <input type='text' class='form-control' data-bind='value: chosenCity().Name'>\
            <!-- /ko -->\
            <!-- ko ifnot: chosenCity -->\
            <input type='text' class='form-control'>\
            <!-- /ko -->\
            <div class='input-group-btn dropdown'>\
                <button type='button' class='btn btn-default dropdown-toggle' id=\"dropdownMenu1\" data-toggle='dropdown'>\
                    <span class='caret'></span>\
                </button>\
                <ul class=\"dropdown-menu pull-right\" role=\"menu\" aria-labelledby=\"dropdownMenu1\"  style='max-height: 200px;min-width:60px;overflow-y:auto' data-bind=\"foreach: cityItems\">\
                    <li><a href='#' data-bind=\"attr: { 'data-id': CityId }, text: Name, click: $parent.cityItemChange\"></a></li>\
                </ul>\
            </div>\
    </div>";



DropDownCity.prototype.generateTemplates = function (templateEngine) {
    templateEngine.addTemplate(this.viewTemplateName, this.viewMarkup);
    templateEngine.addTemplate(this.editTemplateName, this.editMarkup);
}



// ----------------
// bsSelectCity
// ----------------

ko.bindingHandlers.bsSelectCity = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var mode = viewModel.rowDisplayMode()
        var inRow = allBindings.get("inRow");

        var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
        var tpl = isViewMode ? DropDownCity.prototype.viewTemplateName : DropDownCity.prototype.editTemplateName;

        if ($("#" + tpl).length == 0)
            alert("missing call DropDownCity.prototype.generateTemplates(templateEngine)")

        $(element).html($("#" + tpl).html())

        if (isViewMode) {
        }
        else {
            if (viewModel.cityItems == undefined) {
                viewModel.cityItems = ko.observableArray([])
                viewModel.dropDownCity = new DropDownCity();
                viewModel.dropDownCity.getItems("", viewModel.cityItems);
                viewModel.cityItemChange = function (city, event) {
                    viewModel.CityId(city.CityId());
                }
            }

            /*
            $(element)
            .on('click', 'a', function (e) {
            var id = $(this).data('id');
            bindingContext.$data.CityId(id);
            });
            */

            $(element).find('input').attr('readonly', 'readonly');
        }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
}
/////////////////////////////////////
//   City

function TypeaheadCity(vm) {
    var self = this;

    this.vm = vm;

    this.getItems = function (filter, outItems) {
        //var dbItems = $.grep(CityDB.Items, function (a) {
        //    return filter == "" || a.Name.indexOf(filter) == 0
        //});
        CityDB.getItemsForDropDown(filter, 
                function (set) {
                    ko.mapping.fromJS(set, {
                        key: function (city) {
                            return ko.utils.unwrapObservable(city.CityId);
                        },
                        create: function (options) {
                            return new City(options.data, null);
                        }
                    }, outItems);
                }
            );
       }

       this.bloodhound = null;

       this.attachTypeahead = function () {
           if (self.bloodhound == null)
               self.initTypeahead()

            self.bloodhound.initialize(true);

            //$('#filterComponents')
            $('#filterCityNames')
                        .typeahead({
                            highlight: true
                        }, {
                            displayKey: 'val',
                            source: self.bloodhound.ttAdapter()
                        })
                        .on([
                            //'keyup',
                            'typeahead:selected'
            //,'typeahead:closed'
                          ].join(' '), self.onFilter);

        }


        this.onFilter = function ($e, datum) {
            var args = [].slice.call(arguments, 1)
            var type = $e.type;
            if (type == "keyup") {
                if ($e.keyCode == 13) {
                    //$(this).val("");
                    $(this).typeahead('close');
                }
                //return
            }
            self.vm.CityId(datum.cityId)
            var val = $(this).val();
        }


        this.initTypeahead = function () {

            if (self.bloodhound != null)
                return;

            // instantiate the bloodhound suggestion engine
            self.bloodhound = new Bloodhound({
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.val);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                /*remote: {
                    url: '/City/Names?query=%QUERY',
                    filter: function (arr) {
                        return $.map(arr.items, function (item) {
                            return {
                                val: item.Name
                            };
                        });
                    }
                },*/
                limit: 10,
                local: $.map(CityDB.Items, function (city) {
                    return { val: city.Name /*+ ", " + city.something*/, cityId: city.CityId };
                })
            });

            //self.attachTypeahead();
        }

}



TypeaheadCity.prototype.viewTemplateName = "view-city-typeahead-template";
TypeaheadCity.prototype.editTemplateName = "edit-city-typeahead-template";



TypeaheadCity.prototype.viewMarkup =
    "<div class='input-group'>\
        <!-- ko if: chosenCity -->\
            <span data-bind='text: chosenCity().Name'></span>\
        <!-- /ko -->\
        <!-- ko ifnot: chosenCity -->\
            <span class='form-control'>unknow</span>\
        <!-- /ko -->\
     </div>";


TypeaheadCity.prototype.editMarkup = "\
        <!-- ko if: isEditOrAddMode -->\
            <div class='input-group'>\
                <input id='filterCityNames' class=\"form-control input-sm onyx-tt-bg typeahead\" data-field=\"Name\" data-bind=\"value: chosenCity().Name, valueUpdate:'keyup'\" style='padding:2px 6px;'></input>\
                <span class='input-group-btn'>\
                    <button type='submit' name='seach' id='search-btn' class='btn btn-flat'><i class='fa fa-search'></i></button>\
                </span>\
            </div>\
        <!-- /ko -->\
        <!-- ko ifnot: isEditOrAddMode -->\
        <input class=\"form-control\" data-field=\"Name\" data-bind=\"value: Name\"></input>\
        <!-- /ko -->\
    ";

TypeaheadCity.prototype.generateTemplates = function (templateEngine) {
    templateEngine.addTemplate(this.viewTemplateName, this.viewMarkup);
    templateEngine.addTemplate(this.editTemplateName, this.editMarkup);
}



// ----------------
// bsTypeaheadCity
// ----------------

ko.bindingHandlers.bsTypeaheadCity = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var mode = viewModel.rowDisplayMode()
        var inRow = allBindings.get("inRow");

        var isViewMode = inRow && viewModel.isRowViewMode() || !inRow && viewModel.isViewMode()
        var tpl = isViewMode ? TypeaheadCity.prototype.viewTemplateName : TypeaheadCity.prototype.editTemplateName;

        if ($("#" + tpl).length == 0)
            alert("missing call TypeaheadCity.prototype.generateTemplates(templateEngine)")

        $(element).html($("#" + tpl).html())

        if (isViewMode) {
        }
        else {
            // possible collision with dropDownCity
            if (viewModel.cityItems == undefined) {
                viewModel.cityItems = ko.observableArray([])
                viewModel.typeaheadCity = new TypeaheadCity(viewModel);
                viewModel.typeaheadCity.getItems("", viewModel.cityItems);
                viewModel.cityItemChange = function (city, event) {
                    viewModel.CityId(city.CityId());
                }
            }

            if (!isViewMode)  // or add mode only
                viewModel.typeaheadCity.attachTypeahead()
        }       
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

    }
}
/////////////////////////////////////
//   CityList

var CityList = (function () {

    var PageSize = 15;
    var Page = 1;
    var OrderByColumn = "Name";
    var Asc = true;

    // only CityId, Name
    var GetCity = function (id) {
        return CityDB.getItemById(id)
        //return ko.utils.arrayFirst(gridViewModel.itemsAll(), function (p) {
        //    return p.CityId() == id;
        //});
    }

    function GridViewModel() {
        var self = this;
    }

    GridViewModel.prototype = new SLGridViewModel({
        orderByColumn: OrderByColumn,
        columns: City.prototype.getGridColumns(OrderByColumn)
    })

    var gridViewModel = new GridViewModel();

    return {
        getCity: GetCity,
        viewModel: gridViewModel
    }

})();

// 1) we load all items of Foreign Tables like CityList 
// 2) for large foreign tables, we should:
// SELECT PersonId, PersonName, CityId, CityId.Name FROM People JOIN Cities ...
// and implement getName for DB


(function () {
    //<select id='brokerPicker' data-live-search='true' data-size='8' class='form-control' data-bind='options: Brokers, optionsCaption: 'Choose ...',  optionsText : 'DisplayName', value:  accountRow.chosenBroker, event: { change: onChangeBroker }'> </select>\
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    // no need, this is demo app where CityList serves as drop-down only
    //City.prototype.generateTemplates(templateEngine);
    DropDownCity.prototype.generateTemplates(templateEngine); 
    TypeaheadCity.prototype.generateTemplates(templateEngine); 
})();




function PersonDB() {

    this.entityName = "PersonDB";

    this.Items = [
            { PersonId: 1, Name: "Claire", TwitterName: "O'Donnell", IIIsOnTwitter: true, CityId: 104 },
            { PersonId: 2, Name: "Sven", TwitterName: "Mortensen", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 3, Name: "Svetlana", TwitterName: "Omelchenko", IIIsOnTwitter: true, CityId: 104 },
            { PersonId: 4, Name: "Cesar", TwitterName: "Garcia", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 5, Name: "Debra", TwitterName: "Garcia", IIIsOnTwitter: false, CityId: 103 },

            { PersonId: 6, Name: "Kit", TwitterName: "Carson", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 7, Name: "Robert", TwitterName: "Klassen", IIIsOnTwitter: true, CityId: 104 },
            { PersonId: 8, Name: "John", TwitterName: "Flemming", IIIsOnTwitter: false, CityId: 103 },
            { PersonId: 9, Name: "John", TwitterName: "Doo", IIIsOnTwitter: true, CityId: 104 },
            { PersonId: 10, Name: "Do", TwitterName: "Little", IIIsOnTwitter: false, CityId: 101 },

            { PersonId: 11, Name: "Novak", TwitterName: "Djokovic", IIIsOnTwitter: true, CityId: 104 },
            { PersonId: 12, Name: "Rafael", TwitterName: "Nadal", IIIsOnTwitter: false, CityId: 101 },

            { PersonId: 13, Name: "Stan", TwitterName: "Wawrinka", IIIsOnTwitter: false, CityId: 105 },
            { PersonId: 14, Name: "Roger", TwitterName: "Federer", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 15, Name: "Andy", TwitterName: "Murray", IIIsOnTwitter: false, CityId: 103 },
            { PersonId: 16, Name: "Tomas", TwitterName: "Berdych", IIIsOnTwitter: false, CityId: 103 },
            { PersonId: 17, Name: "David", TwitterName: "Ferrer", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 18, Name: "Juan Martin", TwitterName: "Del Potro", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 19, Name: "Milos", TwitterName: "Raonic", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 20, Name: "John", TwitterName: "Isner", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 21, Name: "Kei", TwitterName: "Nishikori", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 22, Name: "Grigor", TwitterName: "Dimitrov", IIIsOnTwitter: false, CityId: 102 },
            { PersonId: 23, Name: "Richard", TwitterName: "Gasquet", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 24, Name: "Fabio", TwitterName: "Fognini", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 25, Name: "Mikhail", TwitterName: "Youzhny", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 26, Name: "Jo-Wilfried", TwitterName: "Tsonga", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 27, Name: "Serena", TwitterName: "Williams", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 28, Name: "Na", TwitterName: "Li", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 29, Name: "Simona", TwitterName: "Halep", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 30, Name: "Agnieszka", TwitterName: "Radwanska", IIIsOnTwitter: false, CityId: 102 },
            { PersonId: 31, Name: "Maria", TwitterName: "Sharapova", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 32, Name: "Petra", TwitterName: "Kvitova", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 33, Name: "Angelique", TwitterName: "Kerber", IIIsOnTwitter: false, CityId: 102 },
            { PersonId: 34, Name: "Jelena", TwitterName: "Jankovic", IIIsOnTwitter: false, CityId: 101 },
            { PersonId: 35, Name: "Ana", TwitterName: "Ivanovic", IIIsOnTwitter: false, CityId: 101 }
        ];

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
                this.Start = (query.page - 1) * query.pageSize;
                this.End = this.Start + query.pageSize;
                this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
                this.SortBy(query.orderBy, query.asc);
                var set = items.slice(this.Start, this.End);
                callBack(set, this.MaxPageIndex, this.Items.length)
            }

    this.GetMaxId = function () {
        var arr = this.Items.map(function (data, i) {
            return data.PersonId;
        });
        return Math.max.apply(null, arr);
    }

    this.GetPerson = function (personId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.PersonId == personId;
        });
        return null;
    }

    this.UpdatePerson = function (data) {
        var person = this.GetPerson(data.PersonId);
        $.each(person, function (name, value) {
            person[name] = data[name];
        });
    }

    this.StorePerson = function (data) {
        this.Items.push(data)
    }

    this.DeletePerson = function (entity) {
        var data = this.GetPerson(entity.PersonId());
        this.Items.splice($.inArray(data, this.Items), 1);
        setTimeout(function () { entity.onDeleted("ok", "deleted") }, 100);
    }

};

PersonDB.prototype = new DBEntity();
// instantiated at PersonList
//var PersonDB = new PersonDB();




    // ---------------------------
    //  Person EXTENDS SLEntity
    // ---------------------------

var Person = function (data, gridViewModel) {
    var self = this;
    this.gridViewModel = gridViewModel; // the same as PersonList.viewModel

    this.PersonId = ko.observable(data.PersonId || 0)
    this.Name = ko.observable(data.Name || "")

    this.IsOnTwitter = ko.observable(data.IsOnTwitter === undefined ? Person.prototype.IsOnTwitter.defaultValue : data.IsOnTwitter)
    this.TwitterName = ko.observable(data.TwitterName || "")

    this.CityId = ko.observable(data.CityId === undefined ? Person.prototype.CityId.defaultValue : data.CityId)
    this.chosenCity = ko.computed(function () {
        return CityList.getCity(this.CityId())
    }, this);

    this.isNew = ko.observable(data.isNew || false);
    this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : Person.DEFAULTS.rowDisplayMode);
}

    Person.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
        placement: "right",
        rowDisplayMode: "rowView"
    })

    Person.prototype = new SLEntity();

    Person.prototype.getDefaults = function () {
        return Person.DEFAULTS
    }

    Person.prototype.entityName = "Person";

    Person.prototype.PersonId = ko.observable(0)
                    .extend({
                        primaryKey: true,
                        headerText: "Id",
                        formLabel: "Id",
                        width: "100px",
                        defaultValue: function () { return this.getNextId() }
                    });

    Person.prototype.Name = ko.observable("")
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

    Person.prototype.IsOnTwitter = ko.observable(false)
            .extend({
                formLabel: "On Twitter",
                defaultValue: false
            });

    Person.prototype.TwitterName = ko.observable("")
        .extend({
            headerText: "Twitter",
            formLabel: "Twitter name",
            width: "auto", // one of the columns with take rest of row space
            defaultValue: ""
        });


    Person.prototype.CityId = ko.observable(0)
        .extend({
            defaultValue: 101
        });

    Person.prototype.chosenCity = ko.observable()
        .extend({
            headerText: "City",
            formLabel: "City",
            width: "200px",
            //presentation: "bsSelectCity"
            presentation: "bsTypeaheadCity"
        });



        /*Person.prototype.viewForm = ko.observable("")
        .extend({
        headerText: "View",
        sortable: false,
        width: "50px",
        presentation: "bsPopoverLink"
        });*/

        Person.prototype.editRow = ko.observable("")
            .extend({
                headerText: "Edit",
                sortable: false,
                width: "50px",
                presentation: "bsRowEditLink"
            });


        Person.prototype.deleteRow = ko.observable("")
            .extend({
                headerText: "Delete",
                sortable: false,
                width: "50px",
                presentation: "bsRowDeleteLink"
            });
        /*
        Person.prototype.editForm = ko.observable("")
            .extend({
                headerText: "Edit",
                sortable: false,
                width: "50px",
                presentation: "bsPopoverLink"
            });

        Person.prototype.deleteForm = ko.observable("")
            .extend({
                headerText: "Delete",
                sortable: false,
                width: "50px",
                presentation: "bsPopoverLink"
            });
        */

        Person.prototype.placement = "bottom";

        Person.prototype.getForm = function () {
            return document.getElementById('person-form-' + this.PersonId())
        }

        Person.prototype.cleanNode = function () {
            ko.cleanNode(this.getForm());
        }

        Person.prototype.renderEditTemplate = function (elem, e) {
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

        Person.prototype.renderViewTemplate = function (elem, e) {
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

        Person.prototype.afterRenderForm = function (elems, vm) {
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

        Person.prototype.cancel = function (data, e, f) {
            //if (self.valuesBeforeEdit != self.serialize())
            //    prompt("Are you sure to discard changes?")
            ko.mapping.fromJSON(this.valuesBeforeEdit, {
                key: function (person) {
                    return ko.utils.unwrapObservable(person.PersonId);
                }
            }, this);
            $('.edit-entity.popoverShown').popover('hide');
        }

        Person.prototype.save = function (data, e) {
            this.store();
            $('.edit-entity.popoverShown').popover('hide');
        }

        Person.prototype.store = function () {
            var data = this.getData()
            if (this.isNew()) {
                this.gridViewModel.storePerson(data);
                this.isNew(false)
            } else {
                this.gridViewModel.updatePerson(data);
            }
        }

        Person.prototype.onRowEditEnd = function () {
            this.store();
        }

        Person.prototype.edit = function (data, e, f) {
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

        Person.prototype.remove = function (data, e, f) {
            if (e)
                e.stopPropagation();
            if (this.isNew()) {  // yet no stored
                //  a call from addRow
                this.gridViewModel.onItemRemoved(this);
            }
            else
                this.gridViewModel.deletePerson(this); // callBack is onDeleted
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

        Person.prototype.getPopover = function () {
            return $(this.popoverElem).data('bs.popover').tip();
        }

        Person.prototype.setAlert = function (msg) {
            this.getPopover().find("div.alert").show('slow').end().find("span.msg").html(msg);
        }

        Person.prototype.onDeleted = function (status, message) {
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

        Person.prototype.templates = {}

        Person.prototype.whichTpl4Row = function () {
            return this.templates[this.rowDisplayMode()];
        }

        Person.prototype.whichTpl = function (that) {
            return that.templates[that.displayMode()];
        }

       


//////////////////
// Typeahead

function PersonListFilter(list) {
    var pList = list;
    var self = this;

    this.bloodhound = null;

    this.attachTypeahead = function () {
        self.bloodhound.initialize(true);

        $('#filterPersonList')
            .typeahead({
                highlight: true
            }, {
                displayKey: 'val',
                source: self.bloodhound.ttAdapter()
            })
            .on([
                'keyup',
                'typeahead:selected'
        //,'typeahead:closed'
                ].join(' '), self.onFilter);

    }

    this.onFilter = function ($e) {
        var args = [].slice.call(arguments, 1)
        var type = $e.type;
        if (type == "keyup") {
            if ($e.keyCode == 13) {
                //$(this).val("");
                $(this).typeahead('close');
            }
            //return
        }
        //var x = type == "keyup" ? $(this).val() : args[0].val;
        //debugger
        var val = $(this).val(); //.toUpperCase();
        var all = val == "";
        Trace("type:" + type + " val:" + val);
        //if (type == "typeahead:selected") {}
        pList.viewModel.SubscribeFilter(val);
    }


    this.initTypeahead = function () {
        if (self.bloodhound != null)
            return;
        // instantiate the bloodhound suggestion engine
        self.bloodhound = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.val);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            //remote: {
            //    url: '/PersonList/Filter?query=%QUERY',
            //    filter: function (data) {
            //        return $.map(data.items, function (item) {
            //            return {
            //                val: item.Name + " " + item.TwitterName
            //            };
            //        });
            //    }
            //},
            limit: 10,
            local: $.map(pList.personDB.Items, function (person) {
                return { val: person.Name + ", " + person.TwitterName };
            })
        });
        self.attachTypeahead();
    }

}

/////////////////////////////////////
//   PersonList

var PersonList = (function (DB) {

    var db = DB,
        PageSize = 5,
        Page = 1,
        Filter = "",
        OrderByColumn = "Name",
        Asc = true;
    // Initial data set

    var listFilter = null;

    var SetListFilter = function (lf) {
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
            key: function (person) {
                return ko.utils.unwrapObservable(person.PersonId);
            },
            create: function (options) {
                return new Person(options.data, gridViewModel);
            }
        }, gridViewModel.itemsAtPage);
        gridViewModel.nItems(nItems);
        gridViewModel.maxPageIndex(maxPageIndex);
    }

    var PushUpdates = function () {
    }

    var GetDB = function () {
        return db;
    }

    var GetPerson = function (id) {
        return ko.utils.arrayFirst(gridViewModel.items(), function (p) { // grep
            return p.PersonId() == id;
        });
    }

    var StorePerson = function (data) {
        db.StorePerson(data)
    }

    var UpdatePerson = function (data) {
        db.UpdatePerson(data)
    }


    var DeletePerson = function (person) {
        db.DeletePerson(person)
    }

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
                return p.PersonId() == id;
            });
        }

        this.updatePerson = function (person) {
            UpdatePerson(person);
        }

        this.storePerson = function (person) {
            StorePerson(person);
        }

        this.deletePerson = function (person) {
            DeletePerson(person);
        }

        this.onItemRemoved = function (person) {
            //person.onRemove();
            this.itemsAtPage.remove(person);
            if (person.isNew)
                this.isAdding(false);
        }

        this.canAddPerson = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this);

        this.whichTpl4Row = function (person) {
            //return person.isRowEdit() ? "person-row-edit-template" : "person-row-template"
            return person.whichTpl4Row();
        }


        this.afterRender = function (elems, z) {
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, person) {
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }

        this.addPerson = function () {
            var data = Person.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var set = [data];
            var persons = ko.observableArray([]);
            ko.mapping.fromJS(set, {
                key: function (person) {
                    return ko.utils.unwrapObservable(person.PersonId);
                },
                create: function (options) {
                    return new Person(options.data, gridViewModel);
                }
            }, persons);
            this.itemsAtPage.push(persons()[0]);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        orderByColumn: OrderByColumn,
        columns: Person.prototype.getGridColumns(OrderByColumn)
    })

    var gridViewModel = new GridViewModel();

    return {
        viewModel: gridViewModel,
        //updatePerson: UpdatePerson,
        //storePerson: StorePerson,
        //deletePerson: DeletePerson,
        setListFilter: SetListFilter,
        personDB: db
    }

})(new PersonDB());


PersonList.setListFilter(new PersonListFilter(PersonList));

(function () {
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };
    Person.prototype.generateTemplates(templateEngine);
})();




