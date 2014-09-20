
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

    this.ItemsFiltered = [];

    // override DBEntity.Subscribe
    this.Subscribe = function (query, callBack) {
        this.ItemsFiltered = this.Items;
        if (query.filter != "") {
            var part = query.filter.split(',');
            if (part.length == 0) {
                var filter = query.filter.toLowerCase();
                this.ItemsFiltered = $.grep(this.Items, function (p) {
                    return p.Name.toLowerCase().indexOf(filter) == 0 ||
                                    p.TwitterName.toLowerCase().indexOf(filter) == 0
                });
            }
            else {
                this.ItemsFiltered = $.grep(this.Items, function (p) {
                    return p.Name == part[0] && p.TwitterName == $.trim(part[1])
                });
            }
        }
        this.Start = (query.page - 1) * query.pageSize;
        this.End = this.Start + query.pageSize;
        /*
        this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
        this.SortBy(query.orderBy, query.asc);
        var set = items.slice(this.Start, this.End);
        callBack(set, this.MaxPageIndex, this.Items.length)
        */
        this.MaxPageIndex = Math.ceil(this.ItemsFiltered.length / query.pageSize) - 1;
        this.SortBy(query.orderBy, query.asc);
        var set = this.ItemsFiltered.slice(this.Start, this.End);
        callBack(set, this.MaxPageIndex, this.ItemsFiltered.length)
    }

    this.GetMaxId = function () {
        var arr = this.Items.map(function (data, i) {
            return data.CityId;
        });
        return Math.max.apply(null, arr);
    }

    this.GetCity = function (cityId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.CityId == cityId;
        });
        return null;
    }

    this.UpdateCity = function (data) {
        var city = this.GetCity(data.CityId);
        $.each(city, function (name, value) {
            city[name] = data[name];
        });
    }

    this.StoreCity = function (data) {
        this.Items.push(data)
    }

    this.DeleteCity = function (entity) {
        var data = this.GetCity(entity.CityId());
        this.Items.splice($.inArray(data, this.Items), 1);
        setTimeout(function () { entity.onDeleted("ok", "deleted") }, 100);
    }

};

CityDB.prototype = new DBEntity();
// instantiated at CityList
//var CityDB = new CityDB();





// ---------------------------
//  City EXTENDS SLEntity
// ---------------------------

var City = function (data, gridViewModel) {
    var self = this;
    this.gridViewModel = gridViewModel; // the same as CityList.viewModel

    this.CityId = ko.observable(data.CityId || 0)
    this.Name = ko.observable(data.Name || "")

    // instance properties, enable functions to be in base (Entity) class
    this.isNew = ko.observable(data.isNew || false);
    this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : City.DEFAULTS.rowDisplayMode);
}

City.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
    placement: "right",
    rowDisplayMode: "rowView"
})

City.prototype = new SLEntity();

City.prototype.entityName = "City";  // City
City.prototype.placement = "bottom";
City.prototype.templates = {};

City.prototype.getDefaults = function () {
    return City.DEFAULTS
}

City.prototype.CityId = ko.observable(0)
        .extend({
            primaryKey: true,
            //headerText: "Id",
            formLabel: "Id",
            width: "100px",
            defaultValue: function () { return this.getNextId() }
        });

City.prototype.Name = ko.observable("")
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

City.prototype.editRow = ko.observable("")
        .extend({
            headerText: "",  //"Edit"
            sortable: false,
            width: "30px",
            presentation: "bsRowEditLink"
        });

City.prototype.deleteRow = ko.observable("")
        .extend({
            headerText: "", // "Delete"
            sortable: false,
            width: "30px",
            presentation: "bsRowDeleteLink"
        });

       


/////////////////////////////////////
//   City

function DropDownCity() {

    this.getItems = function (filter, outItems) {
        //var dbItems = $.grep(CityDB.Items, function (a) {
        //    return filter == "" || a.Name.indexOf(filter) == 0
        //});
        CityList.cityDB.getItemsForDropDown(filter, 
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
        CityList.cityDB.getItemsForDropDown(filter, 
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
                local: $.map(CityList.cityDB.Items, function (city) {
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
//////////////////
// Typeahead

function CityListFilter(list) {
    var pList = list;
    var self = this;

    this.bloodhound = null;

    this.attachTypeahead = function () {
        self.bloodhound.initialize(true);

        $('#filterCityList')
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
            //    url: '/CityList/Filter?query=%QUERY',
            //    filter: function (data) {
            //        return $.map(data.items, function (item) {
            //            return {
            //                val: item.Name + " " + item.TwitterName
            //            };
            //        });
            //    }
            //},
            limit: 10,
            local: $.map(pList.cityDB.Items, function (city) {
                return { val: city.Name + ", " + city.TwitterName };
            })
        });
        self.attachTypeahead();
    }

}

/////////////////////////////////////
//   CityList

var CityList = (function (DB) {

    var db = DB,
        PageSize = 8,
        Page = 1,
        Filter = "",
        OrderByColumn = "Name",
        Asc = true;
    // Initial data set

    var listFilter = null;

    var SetListFilter = function (lf) {
        listFilter = lf;
    }

    var Subscribe = function (page, size) {
        var query = {
            filter: Filter || "",
            page: page || Page,
            pageSize: size || PageSize,
            orderBy: OrderByColumn,
            asc: Asc
        };
        db.Subscribe(query, PushInitialSet);
    }

    var PushInitialSet = function (set, maxPageIndex, nItems) {
        ko.mapping.fromJS(set, {
            key: function (city) {
                return ko.utils.unwrapObservable(city.CityId);
            },
            create: function (options) {
                return new City(options.data, gridViewModel);
            }
        }, gridViewModel.itemsAtPage);
        gridViewModel.nItems(nItems);
        gridViewModel.maxPageIndex(maxPageIndex);
    }

    var PushUpdates = function () {
    }


    var GetCity = function (id) {
        return db.GetCity(id);
    }

    var StoreCity = function (data) {
        db.StoreCity(data)
    }

    var UpdateCity = function (data) {
        db.UpdateCity(data)
    }

    var DeleteCity = function (city) {
        db.DeleteCity(city)
    }

    var GetNextId = function () {
        return db.GetMaxId() + 1;
    }

    function GridViewModel() {
        var self = this;

        // call from SLGrid.init()
        this.Subscribe = function (page, size) {
            //if (page != undefined)
            //    Page = page;
            Subscribe(page, size);
        }

        this.SubscribeFilter = function (filter) {
            if (filter != undefined) {
                Filter = filter;
            }

            Subscribe();
        }

        //this.orderByColumn = function () { return OrderByColumn }
        this.OrderBy = function (column, asc) {
            OrderByColumn = column;
            Asc = asc;
            Subscribe();
        }

        this.getItem = function (id) {
            return ko.utils.arrayFirst(ViewModel.itemsAtPage(), function (p) { // grep
                return p.CityId() == id;
            });
        }

        this.update = function (city) {
            UpdateCity(city);
        }

        this.store = function (city) {
            StoreCity(city);
        }

        this.remove = function (city) {
            DeleteCity(city);
        }

        this.onItemRemoved = function (city) {
            //city.onRemove();
            this.itemsAtPage.remove(city);
            if (city.isNew)
                this.isAdding(false);
        }


        this.whichTpl4Row = function (city) {
            //return city.isRowEdit() ? "city-row-edit-template" : "city-row-template"
            return city.whichTpl4Row();
        }


        this.afterRender = function (elems, z) {
            $.each(elems, function (i, el) {
                /*
                if (typeof el.tagName != "undefined") {
                if (el.tagName == "DIV") {
                var $table = $(el).parent().find('table');
                var n = $table.find('tr[data-index]').length;
                debugger
                $table.find('tr[data-index]:even').addClass('oddRow');
                return false; // break
                }
                }
                */
            });
            //if ($(el).data("index") % 2 == 0) {
            //    $(el).find('td').attr("background-color", "#f9f9f9")
            //}
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, ent) {
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }


        this.canAdd = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this)

        this.add = function () {
            var data = City.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var city = ko.mapping.fromJS(data, {
                key: function (city) {
                    return ko.utils.unwrapObservable(city.CityId);
                },
                create: function (options) {
                    return new City(options.data, self); // self is gridViewModel
                }
            });
            this.itemsAtPage.push(city);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        listTpl: {
            listHeader: "Cities",
            textAdd: "Add City",
            textPager: "Cities",
            filterInputId: "filterCityList",
            tableBordered: true
        },
        orderByColumn: OrderByColumn,
        columns: City.prototype.getGridColumns(OrderByColumn)
    })

    var gridViewModel = new GridViewModel();

    return {
        getCity: GetCity,
        viewModel: gridViewModel,
        setListFilter: SetListFilter,
        cityDB: db
    }

})(new CityDB());


CityList.setListFilter(new CityListFilter(CityList));

(function () {
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };
    City.prototype.generateTemplates(templateEngine);
    DropDownCity.prototype.generateTemplates(templateEngine); 
    TypeaheadCity.prototype.generateTemplates(templateEngine); 
})();






function PostDB() {

    this.entityName = "PostDB";

    this.Items = [

            { PostId: 1, CategoryId: 1, PersonId: 11, Title: "Andy", Content : "something", Created: "2014-01-15 20:30" },
            { PostId: 2, CategoryId: 2, PersonId: 11, Title: "Nadal", Content : "something", Created: "2014-02-12 22:30" },
            { PostId: 3, CategoryId: 1, PersonId: 11, Title: "Roger", Content : "something", Created: "2014-01-15 03:30" },

            { PostId: 4, CategoryId: 4, PersonId: 12, Title: "Andy", Content : "something", Created: "2014-03-15 12:30" },
            { PostId: 5, CategoryId: 4, PersonId: 12, Title: "Novak", Content : "something", Created: "2014-01-07 02:30" },
            { PostId: 6, CategoryId: 1, PersonId: 12, Title: "Roger", Content : "something", Created: "2014-08-16 20:30" },

            { PostId: 7, CategoryId: 1, PersonId: 14, Title: "Andy", Content : "something", Created: "2014-07-15 12:30" },
            { PostId: 8, CategoryId: 3, PersonId: 14, Title: "Novak", Content : "something", Created: "2014-01-23 00:30" },
            { PostId: 9, CategoryId: 1, PersonId: 14, Title: "Nadal", Content : "something", Created: "2014-06-15 22:30" },

            { PostId: 10, CategoryId: 1, PersonId: 15, Title: "Roger", Content : "something", Created: "2014-07-30 16:30" },
            { PostId: 11, CategoryId: 2, PersonId: 15, Title: "Novak", Content : "something", Created: "2014-02-18 05:30" },
            { PostId: 12, CategoryId: 2, PersonId: 15, Title: "Nadal", Content : "something", Created: "2014-01-15 22:30" },

            { PostId: 13, CategoryId: 1, PersonId: 34, Title: "Ana", Content : "something", Created: "2014-06-03 17:30" },
            { PostId: 14, CategoryId: 5, PersonId: 34, Title: "Novak", Content : "something", Created: "2014-03-25 02:30" },
            { PostId: 15, CategoryId: 1, PersonId: 34, Title: "Nadal", Content : "something", Created: "2014-05-08 20:30" },

            { PostId: 16, CategoryId: 3, PersonId: 35, Title: "Jelena", Content : "something", Created: "2014-01-02 02:30" },
            { PostId: 17, CategoryId: 2, PersonId: 35, Title: "Novak", Content : "something", Created: "2014-02-09 12:30" },
            { PostId: 18, CategoryId: 1, PersonId: 35, Title: "Nadal", Content : "something", Created: "2014-01-11 20:30"  }
        ];

     this.ItemsFiltered = [];

    // override DBEntity.Subscribe
    this.Subscribe = function (query, callBack) {
        this.ItemsFiltered = this.Items;
        if (query.filter1N.PersonId) {
            this.ItemsFiltered = $.grep(this.Items, function (p) {
                return p.PersonId == query.filter1N.PersonId;
            });
        }
        else if (query.filter1N.CategoryId) {
            this.ItemsFiltered = $.grep(this.Items, function (p) {
                return p.CategoryId == query.filter1N.CategoryId;
            });
        }
        else { // todo check filtering after 1n filtered this.ItemsFiltered  
            if (query.filter != "") {
                var part = query.filter.split(',');
                if (part.length == 0) {
                    var filter = query.filter.toLowerCase();
                    this.ItemsFiltered = $.grep(this.Items, function (p) {
                        return p.Title.toLowerCase().indexOf(filter) == 0
                    });
                }
                else {
                    this.ItemsFiltered = $.grep(this.Items, function (p) {
                        return p.Title == part[0]
                    });
                }
            }
        }
        this.Start = (query.page - 1) * query.pageSize;
        this.End = this.Start + query.pageSize;
        //this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
        //this.SortBy(query.orderBy, query.asc);
        this.MaxPageIndex = Math.ceil(this.ItemsFiltered.length / query.pageSize) - 1;
        this.SortBy(query.orderBy, query.asc);
        var set = this.ItemsFiltered.slice(this.Start, this.End);
        //callBack(set, this.MaxPageIndex, this.Items.length)
        callBack(set, this.MaxPageIndex, this.ItemsFiltered.length)
    }

    this.GetMaxId = function () {
        var arr = this.Items.map(function (data, i) {
            return data.PostId;
        });
        return Math.max.apply(null, arr);
    }

    this.GetPost = function (postId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.PostId == postId;
        });
        return null;
    }

    this.getCountOfPosts = function (master) {
        var n = 0;
        if (master.PersonId) {
            ko.utils.arrayFirst(this.Items, function (p) {
                if (p.PersonId == master.PersonId)
                    n++;
            });
        }
        else if (master.CategoryId) {
            ko.utils.arrayFirst(this.Items, function (p) {
                if (p.CategoryId == master.CategoryId)
                    n++;
            });
        }
        else {
            alert('PostDB master?')
        }
        return n;
    }

    this.UpdatePost = function (data) {
        var post = this.GetPost(data.PostId);
        $.each(post, function (name, value) {
            post[name] = data[name];
        });
    }

    this.StorePost = function (data) {
        this.Items.push(data)
    }

    this.DeletePost = function (entity) {
        var data = this.GetPost(entity.PostId());
        this.Items.splice($.inArray(data, this.Items), 1);
        setTimeout(function () { entity.onDeleted("ok", "deleted") }, 100);
    }

};

PostDB.prototype = new DBEntity();
// instantiated at PostList
var g_postDB = new PostDB();




    // ---------------------------
    //  Post EXTENDS SLEntity
    // ---------------------------

    var Post = function (data, gridViewModel) {
        var self = this;
        this.gridViewModel = gridViewModel; // the same as PostList.viewModel

        this.PostId = ko.observable(data.PostId || 0)
        this.PersonId = ko.observable(data.PersonId || 0)  // foreign key
        this.Title = ko.observable(data.Title || "")
        this.Content = ko.observable(data.Content || "")
        this.Created = ko.observable(data.Created || "")

        this.isNew = ko.observable(data.isNew || false);
        this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : Post.DEFAULTS.rowDisplayMode);
    }

    Post.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
        placement: "right",
        rowDisplayMode: "rowView"
    })

    Post.prototype = new SLEntity();

    Post.prototype.entityName = "Post";  // Post
    Post.prototype.placement = "bottom";
    Post.prototype.templates = {};

    Post.prototype.getDefaults = function () {
        return Post.DEFAULTS
    }

    Post.prototype.PostId = ko.observable(0)
        .extend({
            primaryKey: true,
            //headerText: "Id",
            formLabel: "Id",
            width: "100px",
            defaultValue: function () { return this.getNextId() }
        });

        Post.prototype.Title = ko.observable("")
        .extend({
            headerText: "Title",
            formLabel: "Title",
            presentation: "bsPopoverLink", // view form
            width: "100px",
            defaultValue: "",
            required: true,
            minLength: 2,
            pattern: { message: 'Please, start with uppercase !', params: '^([A-Z])+' }
        });

        Post.prototype.Content = ko.observable("")
        .extend({
            headerText: "Content",
            formLabel: "Content",
            //width: "200px",
            defaultValue: "",
            required: true,
            minLength: 2,
            pattern: { message: 'Please, start with uppercase !', params: '^([A-Z])+' }
        });

        Post.prototype.Created = ko.observable("")
        .extend({
            headerText: "Created",
            formLabel: "Created",
            width: "160px",
            defaultValue: "",
            required: true,
            minLength: 2,
            pattern: { message: 'Please, start with uppercase !', params: '^([A-Z])+' }
        });


    /*Post.prototype.viewForm = ko.observable("")
        .extend({
        headerText: "View",
        sortable: false,
        width: "50px",
        presentation: "bsPopoverLink"
        });*/

    Post.prototype.editRow = ko.observable("")
        .extend({
            headerText: "",
            sortable: false,
            width: "30px",
            presentation: "bsRowEditLink"
        });


    Post.prototype.deleteRow = ko.observable("")
        .extend({
            headerText: "",
            sortable: false,
            width: "30px",
            presentation: "bsRowDeleteLink"
        });

    /*
    Post.prototype.editForm = ko.observable("")
        .extend({
            headerText: "Edit",
            sortable: false,
            width: "50px",
            presentation: "bsPopoverLink"
        });

    Post.prototype.deleteForm = ko.observable("")
        .extend({
            headerText: "Delete",
            sortable: false,
            width: "50px",
            presentation: "bsPopoverLink"
        });
    */

  
       


/////////////////////////////////////
//   PostList

function PostList(DB) {

    var db = DB,
        PageSize = 5,
        Page = 1,
        Filter = "",
        OrderByColumn = "Created",
        Asc = false;

    // filter by master table, 
    //  Person ---has--->Posts (PersonId) 
    //  Category ---has---> Posts   (CategoryId)
    var Filter1N = {} 

    var self = this;

    var listFilter = null;

    this.SetListFilter = function (lf) {
        listFilter = lf;
    }

    var Subscribe = function (page, size) {
        var query = {
            filter1N: Filter1N,
            filter: Filter || "",
            page: page || Page,
            pageSize: size || PageSize,
            orderBy: OrderByColumn,
            asc: Asc
        };
        db.Subscribe(query, PushInitialSet);
    }

    var PushInitialSet = function (set, maxPageIndex, nItems) {

        ko.mapping.fromJS(set, {
            key: function (post) {
                return ko.utils.unwrapObservable(post.PostId);
            },
            create: function (options) {
                return new Post(options.data, self.viewModel);
            }
        }, self.viewModel.itemsAtPage);
        self.viewModel.nItems(nItems);
        self.viewModel.maxPageIndex(maxPageIndex);
    }

    var PushUpdates = function () {
    }

    this.GetDB = function () {
        return db;
    }

    var GetPost = function (id) {
        return db.GetPost(id);
    }

    var StorePost = function (data) {
        db.StorePost(data)
    }

    var UpdatePost = function (data) {
        db.UpdatePost(data)
    }

    var DeletePost = function (post) {
        db.DeletePost(post)
    }

    var GetNextId = function () {
        return db.GetMaxId() + 1;
    }

    function GridViewModel() {
        var self = this;

        // call from SLGrid.init()


        this.Subscribe = function (page, size) {
            if (typeof page == "object") {
                Filter1N = $.extend({}, page); //page is filter1N
                Subscribe();
            }
            else {
                Subscribe(page, size);
            }
        }

        this.SubscribeFilter = function (filter) {
            if (filter != undefined)
                Filter = filter;
            Subscribe();
        }

        // ----------------------
        // for each

        this.SubscribeForPerson = function (personId) {
            // set other foreign keys to null
            PersonId = personId;
            CategoryId = null;
            Subscribe();
        }

        this.SubscribeForCategory = function (categoryId) {
            // set other foreign keys to null
            PersonId = null;
            CategoryId = categoryId;
            Subscribe();
        }

        // 
        // ------------------------        


        //this.orderByColumn = function () { return OrderByColumn }
        this.OrderBy = function (column, asc) {
            OrderByColumn = column;
            Asc = asc;
            Subscribe();
        }

        this.getItem = function (id) {
            return ko.utils.arrayFirst(self.viewModel.itemsAtPage(), function (p) { // grep
                return p.PostId() == id;
            });
        }

        this.update = function (post) {
            UpdatePost(post);
        }

        this.store = function (post) {
            StorePost(post);
        }

        this.remove = function (post) {
            DeletePost(post);
        }

        this.onItemRemoved = function (post) {
            //post.onRemove();
            this.itemsAtPage.remove(post);
            if (post.isNew)
                this.isAdding(false);
        }


        this.whichTpl4Row = function (post) {
            //return post.isRowEdit() ? "post-row-edit-template" : "post-row-template"
            return post.whichTpl4Row();
        }


        this.afterRender = function (elems, z) {
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, post) {
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }


        this.canAdd = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this)

        this.add = function () {
            var data = Post.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var post = ko.mapping.fromJS(data, {
                key: function (post) {
                    return ko.utils.unwrapObservable(post.PostId);
                },
                create: function (options) {
                    return new Post(options.data, self); // self is gridViewModel
                }
            });
            this.itemsAtPage.push(post);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        listTpl: {
            listHeader: "Posts",
            textAdd: "Add Post",
            textPager: "Posts",
            filterInputId: "no filter", //filterPostList"
            tableBordered: false
        },
        orderByColumn: OrderByColumn,
        columns: Post.prototype.getGridColumns(OrderByColumn)
    })

    //var gridViewModel = new GridViewModel();
    
    this.viewModel = new GridViewModel();
    //return {
    //    viewModel: gridViewModel,
    //    setListFilter: SetListFilter,
    //    postDB: db
    //}
   

}; //)(new PostDB());


function ShowPosts(ent, e, filter1N) {
    var $tr = $(e.target).closest('tr')

    var row2 = $tr.next();
    var div = row2.find('td:first > div');

    if (ent.row2IsVisible()) {
        div.slideUp('slow', function () {
            ent.row2IsVisible(false);
            // ent.onRow2Hidden()
        })
        $(e.target).closest('td').css("border-bottom-width", "1px");
    }
    else {
        if (!ent.row2EverShown()) {
            ent.row2EverShown(true);
            div.slideUp(0);
            if (ent.postListViewModel == null) {
                ent.postListViewModel = new PostList(/*new PostDB()*/g_postDB).viewModel;
                ent.postListViewModel.Subscribe(filter1N);
            }
        }
        ent.row2IsVisible(true);

        ko.renderTemplate('PostListTemplate', 
                ent.postListViewModel,
                { templateEngine: new ko.nativeTemplateEngine(), afterRender: ent.postListViewModel.afterRender },
                div[0], "replaceChildren");

        div.slideDown('slow', function () {
            // ent.onRow2Shown(ent)
        });

        $(e.target).closest('td').css("border-bottom-width", "0px");
    }
}

PostList.prototype.showPosts = ShowPosts;

//PostList.setListFilter(new PostListFilter(PostList));

(function () {
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };
    Post.prototype.generateTemplates(templateEngine);
})();






function PersonDB() {

    this.entityName = "PersonDB";

    this.Items = [
            { PersonId: 1, Name: "Claire", TwitterName: "O'Donnell", IIIsOnTwitter: true, CityId: 104 , NumOfPosts: 3 },
            { PersonId: 2, Name: "Sven", TwitterName: "Mortensen", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 3, Name: "Svetlana", TwitterName: "Omelchenko", IIIsOnTwitter: true, CityId: 104 , NumOfPosts: 3 },
            { PersonId: 4, Name: "Cesar", TwitterName: "Garcia", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 5, Name: "Debra", TwitterName: "Garcia", IIIsOnTwitter: false, CityId: 103 , NumOfPosts: 3 },

            { PersonId: 6, Name: "Kit", TwitterName: "Carson", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 7, Name: "Robert", TwitterName: "Klassen", IIIsOnTwitter: true, CityId: 104 , NumOfPosts: 3 },
            { PersonId: 8, Name: "John", TwitterName: "Flemming", IIIsOnTwitter: false, CityId: 103 , NumOfPosts: 3 },
            { PersonId: 9, Name: "John", TwitterName: "Doo", IIIsOnTwitter: true, CityId: 104 , NumOfPosts: 3 },
            { PersonId: 10, Name: "Do", TwitterName: "Little", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },

            { PersonId: 11, Name: "Novak", TwitterName: "Djokovic", IIIsOnTwitter: true, CityId: 104 , NumOfPosts: 3 },
            { PersonId: 12, Name: "Rafael", TwitterName: "Nadal", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },

            { PersonId: 13, Name: "Stan", TwitterName: "Wawrinka", IIIsOnTwitter: false, CityId: 105 , NumOfPosts: 3 },
            { PersonId: 14, Name: "Roger", TwitterName: "Federer", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 15, Name: "Andy", TwitterName: "Murray", IIIsOnTwitter: false, CityId: 103 , NumOfPosts: 3 },
            { PersonId: 16, Name: "Tomas", TwitterName: "Berdych", IIIsOnTwitter: false, CityId: 103 , NumOfPosts: 3 },
            { PersonId: 17, Name: "David", TwitterName: "Ferrer", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 18, Name: "Juan Martin", TwitterName: "Del Potro", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 19, Name: "Milos", TwitterName: "Raonic", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 20, Name: "John", TwitterName: "Isner", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 21, Name: "Kei", TwitterName: "Nishikori", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 22, Name: "Grigor", TwitterName: "Dimitrov", IIIsOnTwitter: false, CityId: 102 , NumOfPosts: 3 },
            { PersonId: 23, Name: "Richard", TwitterName: "Gasquet", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 24, Name: "Fabio", TwitterName: "Fognini", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 25, Name: "Mikhail", TwitterName: "Youzhny", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 26, Name: "Jo-Wilfried", TwitterName: "Tsonga", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 27, Name: "Serena", TwitterName: "Williams", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 28, Name: "Na", TwitterName: "Li", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 29, Name: "Simona", TwitterName: "Halep", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 30, Name: "Agnieszka", TwitterName: "Radwanska", IIIsOnTwitter: false, CityId: 102 , NumOfPosts: 3 },
            { PersonId: 31, Name: "Maria", TwitterName: "Sharapova", IIIsOnTwitter: false, CityId: 101 , NumOfPosts: 3 },
            { PersonId: 32, Name: "Petra", TwitterName: "Kvitova", IIIsOnTwitter: false, CityId: 101, NumOfPosts: 3 },
            { PersonId: 33, Name: "Angelique", TwitterName: "Kerber", IIIsOnTwitter: false, CityId: 102, NumOfPosts: 3 },
            { PersonId: 34, Name: "Jelena", TwitterName: "Jankovic", IIIsOnTwitter: false, CityId: 101, NumOfPosts: 3 },
            { PersonId: 35, Name: "Ana", TwitterName: "Ivanovic", IIIsOnTwitter: false, CityId: 101, NumOfPosts: 3 }
        ];

    this.ItemsFiltered = [];

    // override DBEntity.Subscribe
        this.Subscribe = function (query, callBack) {
            this.ItemsFiltered = this.Items;
                if (query.filter != "") {
                    var part = query.filter.split(',');
                    if (part.length == 0) {
                        var filter = query.filter.toLowerCase();
                        this.ItemsFiltered = $.grep(this.Items, function (p) {
                            return  p.Name.toLowerCase().indexOf(filter) == 0 ||
                                    p.TwitterName.toLowerCase().indexOf(filter) == 0
                        });
                    }
                    else {
                        this.ItemsFiltered = $.grep(this.Items, function (p) {
                            return p.Name == part[0] && p.TwitterName == $.trim(part[1])
                        });
                    }
                }
                this.Start = (query.page - 1) * query.pageSize;
                this.End = this.Start + query.pageSize;
                /*
                this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
                this.SortBy(query.orderBy, query.asc);
                var set = items.slice(this.Start, this.End);
                callBack(set, this.MaxPageIndex, this.Items.length)
                */
                this.MaxPageIndex = Math.ceil(this.ItemsFiltered.length / query.pageSize) - 1;
                this.SortBy(query.orderBy, query.asc);
                var set = this.ItemsFiltered.slice(this.Start, this.End);
                callBack(set, this.MaxPageIndex, this.ItemsFiltered.length)
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
            return CityList.getCity(this.CityId()) // from DB, rather than itemsAtPage
        }, this);

        this.NumOfPosts = ko.observable(data.NumOfPosts);

        // instance properties, enable functions to be in base (Entity) class
        this.postListViewModel = null;
        this.row2IsVisible = ko.observable(false);
        this.row2EverShown = ko.observable(false);

        this.isNew = ko.observable(data.isNew || false);
        this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : Person.DEFAULTS.rowDisplayMode);
    }

    Person.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
        placement: "right",
        rowDisplayMode: "rowView"
    })

    Person.prototype = new SLEntity();

    Person.prototype.entityName = "Person";  // Person
    Person.prototype.placement = "bottom";
    Person.prototype.templates = {};

    Person.prototype.getDefaults = function () {
        return Person.DEFAULTS
    }

    Person.prototype.PersonId = ko.observable(0)
        .extend({
            primaryKey: true,
            //headerText: "Id",
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
            presentation: "bsSelectCity"
            //presentation: "bsTypeaheadCity"
        });


    Person.prototype.showPosts = function (ent, e) {
        PostList.prototype.showPosts(ent, e, { PersonId: this.PersonId() })
    }

    Person.prototype.NumOfPosts = ko.observable("")
        .extend({
            headerText: "Posts",
            formLabel: "Posts",
            sortable: false,
            presentation: "bsActionLink",
            readOnly: true,
            options: {
                action: "javascript:showPosts",  //   "/Controller/Action"
                badgeColor: 'LightBlue'
            },
            width: "80px"
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
            headerText: "",  //"Edit"
            sortable: false,
            width: "30px",
            presentation: "bsRowEditLink"
        });

    Person.prototype.deleteRow = ko.observable("")
        .extend({
            headerText: "", // "Delete"
            sortable: false,
            width: "30px",
            presentation: "bsRowDeleteLink"
        });

        /*
        Person.prototype.editDeleteRow = ko.observable("")
        .extend({
        headerText: "",
        sortable: false,
        width: "50px",
        presentation: "bsRowEditLink"
        });
        */

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

    var Subscribe = function (page, size) {
        var query = {
            filter: Filter || "",
            page: page || Page,
            pageSize: size || PageSize,
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
        return db.GetPerson(id);
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
        this.Subscribe = function (page, size) {
            //if (page != undefined)
            //    Page = page;
            Subscribe(page, size);
        }

        this.SubscribeFilter = function (filter) {
            if (filter != undefined) {
                Filter = filter;
            }

            Subscribe();
        }

        //this.orderByColumn = function () { return OrderByColumn }
        this.OrderBy = function (column, asc) {
            OrderByColumn = column;
            Asc = asc;
            Subscribe();
        }

        this.getItem = function (id) {
            return ko.utils.arrayFirst(ViewModel.itemsAtPage(), function (p) { // grep
                return p.PersonId() == id;
            });
        }

        this.update = function (person) {
            UpdatePerson(person);
        }

        this.store = function (person) {
            StorePerson(person);
        }

        this.remove = function (person) {
            DeletePerson(person);
        }

        this.onItemRemoved = function (person) {
            //person.onRemove();
            this.itemsAtPage.remove(person);
            if (person.isNew)
                this.isAdding(false);
        }


        this.whichTpl4Row = function (person) {
            //return person.isRowEdit() ? "person-row-edit-template" : "person-row-template"
            return person.whichTpl4Row();
        }


        this.afterRender = function (elems, z) {
            $.each(elems, function (i, el) {
                /*
                if (typeof el.tagName != "undefined") {
                if (el.tagName == "DIV") {
                var $table = $(el).parent().find('table');
                var n = $table.find('tr[data-index]').length;
                debugger
                $table.find('tr[data-index]:even').addClass('oddRow');
                return false; // break
                }
                }
                */
            });
            //if ($(el).data("index") % 2 == 0) {
            //    $(el).find('td').attr("background-color", "#f9f9f9")
            //}
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, ent) {
            ent.NumOfPosts(g_postDB.getCountOfPosts({ PersonId: ent.PersonId() }) );
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }


        this.canAdd = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this)

        this.add = function () {
            var data = Person.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var person = ko.mapping.fromJS(data, {
                key: function (person) {
                    return ko.utils.unwrapObservable(person.PersonId);
                },
                create: function (options) {
                    return new Person(options.data, self); // self is gridViewModel
                }
            });
            this.itemsAtPage.push(person);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        listTpl: {
            listHeader: "People",
            textAdd: "Add Person",
            textPager: "People",
            filterInputId: "filterPersonList",
            tableBordered: true
        },
        orderByColumn: OrderByColumn,
        columns: Person.prototype.getGridColumns(OrderByColumn)
    })

    var gridViewModel = new GridViewModel();

    return {
        viewModel: gridViewModel,
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






function CategoryDB() {

    this.entityName = "CategoryDB";

    this.Items = [
            { CategoryId: 1, Name: "Private", NumOfPosts: 3 },
            { CategoryId: 2, Name: "Job", NumOfPosts: 3 },
            { CategoryId: 3, Name: "Family", NumOfPosts: 3 },
            { CategoryId: 4, Name: "Nature", NumOfPosts: 3 },
            { CategoryId: 5, Name: "Photos", NumOfPosts: 3 }
        ];

    this.ItemsFiltered = [];

    // override DBEntity.Subscribe
        this.Subscribe = function (query, callBack) {
            this.ItemsFiltered = this.Items;
                if (query.filter != "") {
                    var part = query.filter.split(',');
                    if (part.length == 0) {
                        var filter = query.filter.toLowerCase();
                        this.ItemsFiltered = $.grep(this.Items, function (p) {
                            return  p.Name.toLowerCase().indexOf(filter) == 0 ||
                                    p.TwitterName.toLowerCase().indexOf(filter) == 0
                        });
                    }
                    else {
                        this.ItemsFiltered = $.grep(this.Items, function (p) {
                            return p.Name == part[0] && p.TwitterName == $.trim(part[1])
                        });
                    }
                }
                this.Start = (query.page - 1) * query.pageSize;
                this.End = this.Start + query.pageSize;
                /*
                this.MaxPageIndex = Math.ceil(this.Items.length / query.pageSize) - 1;
                this.SortBy(query.orderBy, query.asc);
                var set = items.slice(this.Start, this.End);
                callBack(set, this.MaxPageIndex, this.Items.length)
                */
                this.MaxPageIndex = Math.ceil(this.ItemsFiltered.length / query.pageSize) - 1;
                this.SortBy(query.orderBy, query.asc);
                var set = this.ItemsFiltered.slice(this.Start, this.End);
                callBack(set, this.MaxPageIndex, this.ItemsFiltered.length)
            }

    this.GetMaxId = function () {
        var arr = this.Items.map(function (data, i) {
            return data.CategoryId;
        });
        return Math.max.apply(null, arr);
    }

    this.GetCategory = function (categoryId) {
        return ko.utils.arrayFirst(this.Items, function (p) {
            return p.CategoryId == categoryId;
        });
        return null;
    }

    this.UpdateCategory = function (data) {
        var category = this.GetCategory(data.CategoryId);
        $.each(category, function (name, value) {
            category[name] = data[name];
        });
    }

    this.StoreCategory = function (data) {
        this.Items.push(data)
    }

    this.DeleteCategory = function (entity) {
        var data = this.GetCategory(entity.CategoryId());
        this.Items.splice($.inArray(data, this.Items), 1);
        setTimeout(function () { entity.onDeleted("ok", "deleted") }, 100);
    }

};

CategoryDB.prototype = new DBEntity();
// instantiated at CategoryList
//var CategoryDB = new CategoryDB();




    // ---------------------------
    //  Category EXTENDS SLEntity
    // ---------------------------

    var Category = function (data, gridViewModel) {
        var self = this;
        this.gridViewModel = gridViewModel; // the same as CategoryList.viewModel

        this.CategoryId = ko.observable(data.CategoryId || 0)
        this.Name = ko.observable(data.Name || "")

        this.NumOfPosts = ko.observable(data.NumOfPosts);

        // instance properties, enable functions to be in base (Entity) class
        this.postListViewModel = null;
        this.row2IsVisible = ko.observable(false);
        this.row2EverShown = ko.observable(false);

        this.isNew = ko.observable(data.isNew || false);
        this.rowDisplayMode = ko.observable(data.isNew ? "rowAdd" : Category.DEFAULTS.rowDisplayMode);
    }

    Category.DEFAULTS = $.extend({}, SLEntity.DEFAULTS, {
        placement: "right",
        rowDisplayMode: "rowView"
    })

    Category.prototype = new SLEntity();

    Category.prototype.entityName = "Category";  // Category
    Category.prototype.placement = "bottom";
    Category.prototype.templates = {};

    Category.prototype.getDefaults = function () {
        return Category.DEFAULTS
    }

    Category.prototype.CategoryId = ko.observable(0)
        .extend({
            primaryKey: true,
            //headerText: "Id",
            formLabel: "Id",
            width: "100px",
            defaultValue: function () { return this.getNextId() }
        });

    Category.prototype.Name = ko.observable("")
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


     Category.prototype.showPosts = function (ent, e) {
        PostList.prototype.showPosts(ent, e, { CategoryId: this.CategoryId() })
    }

    Category.prototype.NumOfPosts = ko.observable("")
        .extend({
            headerText: "Posts",
            formLabel: "Posts",
            sortable: false,
            presentation: "bsActionLink",
            options: {
                action: "javascript:showPosts",  //   "/Controller/Action"
                badgeColor: 'LightBlue',
                readOnly: true 
            },
            width: "80px"
        });

    /*Category.prototype.viewForm = ko.observable("")
        .extend({
        headerText: "View",
        sortable: false,
        width: "50px",
        presentation: "bsPopoverLink"
        });*/

    Category.prototype.editRow = ko.observable("")
        .extend({
            headerText: "",  //"Edit"
            sortable: false,
            width: "30px",
            presentation: "bsRowEditLink"
        });

    Category.prototype.deleteRow = ko.observable("")
        .extend({
            headerText: "", // "Delete"
            sortable: false,
            width: "30px",
            presentation: "bsRowDeleteLink"
        });

        /*
        Category.prototype.editDeleteRow = ko.observable("")
        .extend({
        headerText: "",
        sortable: false,
        width: "50px",
        presentation: "bsRowEditLink"
        });
        */

    /*
    Category.prototype.editForm = ko.observable("")
        .extend({
            headerText: "Edit",
            sortable: false,
            width: "50px",
            presentation: "bsPopoverLink"
        });

    Category.prototype.deleteForm = ko.observable("")
        .extend({
            headerText: "Delete",
            sortable: false,
            width: "50px",
            presentation: "bsPopoverLink"
        });
    */

  
       


//////////////////
// Typeahead

function CategoryListFilter(list) {
    var pList = list;
    var self = this;

    this.bloodhound = null;

    this.attachTypeahead = function () {
        self.bloodhound.initialize(true);

        $('#filterCategoryList')
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
            //    url: '/CategoryList/Filter?query=%QUERY',
            //    filter: function (data) {
            //        return $.map(data.items, function (item) {
            //            return {
            //                val: item.Name + " " + item.TwitterName
            //            };
            //        });
            //    }
            //},
            limit: 10,
            local: $.map(pList.categoryDB.Items, function (category) {
                return { val: category.Name + ", " + category.TwitterName };
            })
        });
        self.attachTypeahead();
    }

}

/////////////////////////////////////
//   CategoryList

var CategoryList = (function (DB) {

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

    var Subscribe = function (page, size) {
        var query = {
            filter: Filter || "",
            page: page || Page,
            pageSize: size || PageSize,
            orderBy: OrderByColumn,
            asc: Asc
        };
        db.Subscribe(query, PushInitialSet);
    }

    var PushInitialSet = function (set, maxPageIndex, nItems) {
        ko.mapping.fromJS(set, {
            key: function (category) {
                return ko.utils.unwrapObservable(category.CategoryId);
            },
            create: function (options) {
                return new Category(options.data, gridViewModel);
            }
        }, gridViewModel.itemsAtPage);
        gridViewModel.nItems(nItems);
        gridViewModel.maxPageIndex(maxPageIndex);
    }

    var PushUpdates = function () {
    }


    var GetCategory = function (id) {
        return db.GetCategory(id);
    }

    var StoreCategory = function (data) {
        db.StoreCategory(data)
    }

    var UpdateCategory = function (data) {
        db.UpdateCategory(data)
    }

    var DeleteCategory = function (category) {
        db.DeleteCategory(category)
    }

    var GetNextId = function () {
        return db.GetMaxId() + 1;
    }

    function GridViewModel() {
        var self = this;

        // call from SLGrid.init()
        this.Subscribe = function (page, size) {
            //if (page != undefined)
            //    Page = page;
            Subscribe(page, size);
        }

        this.SubscribeFilter = function (filter) {
            if (filter != undefined) {
                Filter = filter;
            }

            Subscribe();
        }

        //this.orderByColumn = function () { return OrderByColumn }
        this.OrderBy = function (column, asc) {
            OrderByColumn = column;
            Asc = asc;
            Subscribe();
        }

        this.getItem = function (id) {
            return ko.utils.arrayFirst(ViewModel.itemsAtPage(), function (p) { // grep
                return p.CategoryId() == id;
            });
        }

        this.update = function (category) {
            UpdateCategory(category);
        }

        this.store = function (category) {
            StoreCategory(category);
        }

        this.remove = function (category) {
            DeleteCategory(category);
        }

        this.onItemRemoved = function (category) {
            //category.onRemove();
            this.itemsAtPage.remove(category);
            if (category.isNew)
                this.isAdding(false);
        }


        this.whichTpl4Row = function (category) {
            //return category.isRowEdit() ? "category-row-edit-template" : "category-row-template"
            return category.whichTpl4Row();
        }


        this.afterRender = function (elems, z) {
            $.each(elems, function (i, el) {
                /*
                if (typeof el.tagName != "undefined") {
                if (el.tagName == "DIV") {
                var $table = $(el).parent().find('table');
                var n = $table.find('tr[data-index]').length;
                debugger
                $table.find('tr[data-index]:even').addClass('oddRow');
                return false; // break
                }
                }
                */
            });
            //if ($(el).data("index") % 2 == 0) {
            //    $(el).find('td').attr("background-color", "#f9f9f9")
            //}
            if (listFilter)
                listFilter.initTypeahead();
        }

        this.afterRenderTR = function (elems, ent) {
            ent.NumOfPosts(g_postDB.getCountOfPosts({ CategoryId: ent.CategoryId() }));
            $.each(elems, function (i, el) {
                if (el.tagName == "TR") {
                }
            });
        }

        this.isAdding = ko.observable(false);

        this.getNextId = function () {
            return GetNextId();
        }


        this.canAdd = ko.computed(function () {
            return this.itemsAtPage().length < PageSize + 1;
        }, this)

        this.add = function () {
            var data = Category.prototype.defaultData(this);
            data = $.extend({}, data, { isNew: true }) // , isRowEdit: true
            this.isAdding(true);
            var category = ko.mapping.fromJS(data, {
                key: function (category) {
                    return ko.utils.unwrapObservable(category.CategoryId);
                },
                create: function (options) {
                    return new Category(options.data, self); // self is gridViewModel
                }
            });
            this.itemsAtPage.push(category);
        }

    } // end of GridViewModel

    GridViewModel.prototype = new SLGridViewModel({
        listTpl: {
            listHeader: "Categories",
            textAdd: "Add Category",
            textPager: "Categories",
            filterInputId: "filterCategoryList",
            tableBordered: true
        },
        orderByColumn: OrderByColumn,
        columns: Category.prototype.getGridColumns(OrderByColumn)
    })

    var gridViewModel = new GridViewModel();

    return {
        viewModel: gridViewModel,
        setListFilter: SetListFilter,
        categoryDB: db
    }

})(new CategoryDB());


CategoryList.setListFilter(new CategoryListFilter(CategoryList));

(function () {
    var templateEngine = new ko.nativeTemplateEngine();
    templateEngine.addTemplate = function (templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };
    Category.prototype.generateTemplates(templateEngine);
})();




