var budgetController = (function(){
    var Expense = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    }

    Expense.prototype.calcPerc = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.val / totalIncome) *100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPerc = function(){
        return this.percentage;
    };

    var Income = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var calculateTotal = function(type){
        var sum = 0;

        theData.allItems[type].forEach(function(cur){
            sum += cur.val;
        });

        theData.totals[type] = sum;
    }

    var theData = {
        allItems : {
            exp: [],
            inc: [],
        },
        totals : {
            exp: 0,
            inc: 0,
        },
        budget : 0,
        percentage : -1,
    };

    return {
        addItem: function(des, type, val){
            var newItem, ID;
            
            if(theData.allItems[type].length > 0){
                ID = theData.allItems[type][theData.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }

            theData.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem : function(type, id){
            var ids, index;
            
            ids = theData.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1 ){
                theData.allItems[type].splice(index, 1);  // remove 1 item at index
            }
        },
        
        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');

            theData.budget = theData.totals.inc - theData.totals.exp;

            if(theData.totals.inc > 0){
                theData.percentage = Math.round((theData.totals.exp / theData.totals.inc )*100);
            }else{
                theData.percentage = -1;
            }
        },

        calculatePercentages : function(){
            theData.allItems.exp.forEach(function(cur){
                cur.calcPerc(theData.totals.inc);
            });
        },

        getPercentages : function(){
            // using map to store in allper array
            var allPer = theData.allItems.exp.map(function(cur){
                // console.log(cur.getPerc());
                return cur.getPerc();
            });
            return allPer;
        },

        getBudget: function(){
            return {
                budget : theData.budget,
                totalInc : theData.totals.inc,
                totalExp : theData.totals.exp,
                per : theData.percentage,
            };
        },

        testing: function(){
            console.log(theData);
        }
    }

})();

var uiController = (function(){

    var DOMstrings = {
        inputText: '.add__description',
        inputType: '.add__type',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incContainer: '.income__list',
        expContainer: '.expenses__list',
        budgetlabel: '.budget__value',
        incLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentage: '.item__percentage',
        monthAndYear: '.budget__title--month',
    };

    var formatNumber= function(num, type){

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        formattedInt = (function(x){
            return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        })(int);

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + formattedInt + '.' +  dec;

    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    return {
        getInput: function(){
            return {
                text : document.querySelector(DOMstrings.inputText).value,
                type : document.querySelector(DOMstrings.inputType).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        getListItem: function(obj, type){
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix" ><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div > ';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.val, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem : function(id){
            var element = document.getElementById(id);
            element.parentNode.removeChild(element)
        },

        clearFields : function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputText + ', ' + DOMstrings.inputValue); //its list cant use slice directly

            var fieldsArray = Array.prototype.slice.call(fields); // now array

            fieldsArray.forEach(function(curr, index, arr){
                curr.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj){
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            if(obj.budget !== 0){
                document.querySelector(DOMstrings.budgetlabel).textContent = formatNumber(obj.budget, type);
            }else{
                // document.querySelector(DOMstrings.budgetlabel).textContent = formatNumber(obj.budget, 'inc');
                document.querySelector(DOMstrings.budgetlabel).textContent = obj.budget;
            }
            document.querySelector(DOMstrings.incLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expLabel).textContent = formatNumber(obj.totalExp, 'exp');
           
            if(obj.per > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.per + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "--";
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expPercentage);

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '--';
                }
            });
        },

        displayMonth: function(){
            var now, year, month, allMonths;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstrings.monthAndYear).textContent = allMonths[month]+', '+year;
        },

        changeType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType+',' +
                DOMstrings.inputText+',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMstrings;
        }
    };
})();

var appController = (function(budgetCtl, uiCtrl){

    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function(){
        budgetCtl.calculateBudget();

        var budget = budgetCtl.getBudget();

        uiCtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        budgetCtl.calculatePercentages();

        var per = budgetCtl.getPercentages();

        // console.log(per);
        uiCtrl.displayPercentages(per);
    };

    var ctrlAddItem = function(){

        var newItem, input;
        
        input = uiCtrl.getInput();

        if(input.text !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtl.addItem(input.text, input.type, input.value);

            uiCtrl.getListItem(newItem, input.type);

            uiCtrl.clearFields();
            
            updateBudget();

            updatePercentages();
        }
    }

    var ctrlDeleteItem = function(e){
        var itemID, type, id, splitID;
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            budgetCtl.deleteItem(type, id);

            uiCtrl.deleteListItem(itemID);

            updateBudget();
        }
    };

    return {
        init: function(){
            console.log("Application Started");
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                per : -1
            });
            setupEventListeners();
        }
    }

    
})(budgetController, uiController);


appController.init();