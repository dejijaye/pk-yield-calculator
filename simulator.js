// globals
var totalPKNAvailable = 30;
var totalExtracts = {}
// Shift One (Hours)	8
// Shift Two (Hours)	8
// Shifts/week	12
// PKN Input Machine 1 (TPH)	0.625
// PKN -> PKC1 Efficiency (M1)	55%
// PKN -> PKO Efficiency (M1)	35%
// PKN -> PKSL Efficiency (M1)	10%
// PKN Input Machine 2 (TPH)	0.4166666667
// PKN -> PKC Efficiency (M2)	55%
// PKN -> PKO Efficiency (M2)	35%
// PKN -> PKSL Efficiency (M2)	10%
var PKO_PRICE = 350000; // PKO PRICE	₦350,000
var PKSL_PRICE = 40000;// PKSL PRICE	₦40,000
var PKC2_PRICE = 40000;// PKC2 PRICE	₦40,000
var PKN_PRICE = 135000;// PKN PRICE	₦135,000
var WORKER = 30000;// Casual Worker	₦30,000
var MECHANIC = 120000;// Mechanic/Engineer	₦120,000
var PRODUCTION = 80000// Production Manager	₦80,000
var SECURITY = 50000;// SECURITY	₦50,000
var NEPA = 0.25;// Expected NEPA/day	25%
var GEN = 0.75;// Expected Gen/day	75%
var NEPA_HOURLY = 833;// NEPA cost/hour	₦833
var GEN_HOURLY = 1667// GEN COST/HOUR;	₦1,667
var CAR_RENTAL = 16500// Car Rent/week	₦16,500
// SECOND CRUSH PROCESSING DISCOUNT	100%
// PKC1 -> PKC2 Efficiency (M1)	86%
// PKC1 -> PK0 Efficiency (M1)	9%
// PKC1 -> PKSL Efficiency (M1)	5%
// PKC1 -> PKC2 Efficiency (M2)	86%
// PKC1 -> PK0 Efficiency (M2)	9%
// PKC1 -> PKSL Efficiency (M2)	5%

// machine object
function Expeller (capacity, type, brand) {
    var doublePress, pkoFirstPressYield, pkoSecondPressYield, pkc1FirstPressYield;
    this.capacity = capacity;
    this.brand = brand;

    switch (type.toLowerCase()) {
        case 'local':
            doublePress = false;
            pkoFirstPressYield = 0.35;
            pkc1FirstPressYield = 0.55;
            break;
        case 'imported':
            doublePress = true;
            pkoFirstPressYield = 0.31;
            pkoSecondPressYield = 0.05;
            pkc1FirstPressYield = 0.5;
            pkc2SecondPressYield = 0.95;
            break;
        default:
            console.log('yeah');
        
    }

    this.capacityPerhour = function () {
        return this.capacity / 24;
    }


    this.firstCrush = function (shiftHours, pknAvailable) {
        var extract = {
            pko: 0,
            pkc1: 0
        };

        var pknCrushed = 0;
        // calculate the amount of pkc, pko and pksl produced in each shift
        for (var i = 0; i < shiftHours; i++) {
            if(pknAvailable >= this.capacityPerhour()) {
                pknAvailable -= this.capacityPerhour();
    
                pknCrushed += this.capacityPerhour();
                extract.pko += this.capacityPerhour() * pkoFirstPressYield;
                extract.pkc1 += this.capacityPerhour() * pkc1FirstPressYield;
                if(pknAvailable <= 0) {
                    pknAvailable = 0;
                    extract.availablePkn = 0;
                    // console.log("No more pkn to crush at the " + i + "th hour");
                    break;
                }
                
            }
        }
        extract.pknAvailable = pknAvailable;
        // console.log(extract.pknAvailable, "pkn available");
        // extract.pksl = this.capacity *shiftHours * 
        return extract;
    }

    this.secondCrush = function(shiftHours, pkc1Available) {
        var extract = {
            pko: 0,
            pkc2: 0
        };

        var pkc1Crushed = 0
        for(var i = 0; i < shiftHours; i++) {
            if(pkc1Available >= this.capacityPerhour()) {
                pkc1Available -= this.capacityPerhour();
                pkc1Crushed += this.capacityPerhour();
                extract.pko += this.capacityPerhour() * pkoSecondPressYield;
                extract.pkc2 += this.capacityPerhour() * pkc2SecondPressYield;   
                if(pkc1Available <= 0) {
                    pkc1Available = 0;
                    extract.availablePkc1 = 0;
                    // console.log('No more pkc1 to crush at the ' + i + 'th hour');
                    break;
                }
            }
            
        }
        extract.pkc1Available = pkc1Available;
        // console.log(extract.pkc1Available, "pkc1 available");

        return extract;
    }
}

// Daily schedule
function Schedule1 (machineArr, numOfShifts, shiftHour, availablePkn, availablePkc1) {
    this.machine1 = machineArr[0];
    this.machine2 = machineArr[1];
    this.numOfShifts = numOfShifts;
    this.shiftHour = shiftHour;
    this.availablePkn = availablePkn;
    this.availablePkc1 = availablePkc1;

    var extract1 = this.machine1.firstCrush(shiftHour, this.availablePkn);
    var extract2 = this.machine2.secondCrush (shiftHour, this.availablePkc1);
    
    var pkoAfterFirstPress = extract1.pko + extract2.pko;
    this.availablePkc1 = extract1.pkc1 + extract2.pkc1Available;
    this.availablePkn = extract1.pknAvailable;


    var extract3 = this.machine1.firstCrush(shiftHour, this.availablePkn);
    var extract4 = this.machine2.secondCrush(shiftHour, this.availablePkc1);

    this.availablePkc1 = extract3.pkc1 + extract4.pkc1Available;
    var pkoAfterSecondPress = pkoAfterFirstPress + extract3.pko + extract4.pko;
    var pkc2AfterSecondPress = extract4.pkc2 + extract2.pkc2;
    this.availablePkn = extract3.pknAvailable;

    return {
        pkoAfterSecondPress: pkoAfterSecondPress,
        pkc2AfterSecondPress: pkc2AfterSecondPress,
        availablePkc1: this.availablePkc1,
        availablePkn: this.availablePkn
    };
}

// Daily schedule
function Schedule2 (machineArr, numOfShifts, shiftHour, availablePkn, availablePkc1) {
    this.machine1 = machineArr[0];
    this.machine2 = machineArr[1];
    this.numOfShifts = numOfShifts;
    this.shiftHour = shiftHour;
    this.availablePkn = availablePkn;
    this.availablePkc1 = availablePkc1;

    var mac1Pkn = this.machine1.capacityPerhour() * shiftHour;
    var mac2Pkn = this.machine2.capacityPerhour() * shiftHour

    var extract1 = this.machine1.firstCrush(shiftHour, mac1Pkn);
    var extract2 = this.machine2.firstCrush(shiftHour, mac2Pkn);
    
    var pkoAfterFirstPress = extract1.pko + extract2.pko;
    this.availablePkc1 += extract1.pkc1 + extract2.pkc1;
    this.availablePkn =  this.availablePkn - mac1Pkn - mac2Pkn + extract1.pknAvailable + extract2.pknAvailable;


    var extract3 = this.machine1.firstCrush(shiftHour, this.availablePkn);
    var extract4 = this.machine2.secondCrush(shiftHour, this.availablePkc1);

    this.availablePkc1 = extract3.pkc1 + extract4.pkc1Available;
    var pkoAfterSecondPress = pkoAfterFirstPress + extract3.pko + extract4.pko;
    var pkc2AfterSecondPress = extract4.pkc2;
    this.availablePkn = extract3.pknAvailable;

    return {
        pkoAfterSecondPress: pkoAfterSecondPress,
        pkc2AfterSecondPress: pkc2AfterSecondPress,
        availablePkc1: this.availablePkc1,
        availablePkn: this.availablePkn
    };
}

// Daily schedule
function Schedule3 (machineArr, numOfShifts, shiftHour, availablePkn, availablePkc1) {
    this.machine1 = machineArr[0];
    this.machine2 = machineArr[1];
    this.numOfShifts = numOfShifts;
    this.shiftHour = shiftHour;
    this.availablePkn = availablePkn;
    this.availablePkc1 = availablePkc1;

    var mac1Pkn = this.machine1.capacityPerhour() * shiftHour;
    var mac2Pkn = this.machine2.capacityPerhour() * shiftHour

    var extract1 = this.machine1.firstCrush(shiftHour, mac1Pkn);
    var extract2 = this.machine2.firstCrush(shiftHour, mac2Pkn);
    
    var pkoAfterFirstPress = extract1.pko + extract2.pko;
    this.availablePkc1 += extract1.pkc1 + extract2.pkc1;
    this.availablePkn =  this.availablePkn - mac1Pkn - mac2Pkn + extract1.pknAvailable + extract2.pknAvailable;

    var extract3 = this.machine1.secondCrush(shiftHour, this.availablePkc1/2);
    var extract4 = this.machine2.secondCrush(shiftHour, this.availablePkc1/2);

    this.availablePkc1 = extract3.pkc1Available + extract4.pkc1Available;
    var pkoAfterSecondPress = pkoAfterFirstPress + extract3.pko + extract4.pko;
    var pkc2AfterSecondPress = extract4.pkc2 + extract3.pkc2;

    return {
        pkoAfterSecondPress: pkoAfterSecondPress,
        pkc2AfterSecondPress: pkc2AfterSecondPress,
        availablePkc1: this.availablePkc1,
        availablePkn: this.availablePkn
    };
}

function WeeklySchedule (schedule, numOfDays) {
    this.schedule = schedule;

    this.numOfDays = numOfDays;

    this.weeklyPkoProduction = function(){
        return schedule.pkoAfterSecondPress * this.numOfDays; 
    };

    this.weeklyPkcProduction = function() {
        return schedule.pkc2AfterSecondPress * this.numOfDays;
    };

    this.weeklyPkc1left = function() {
        return schedule.availablePkc1 * this.numOfDays;
    }
}


function Factory (machineArr, scheduleType, numOfDays, pkn, pkc1) {
    var fc = this;

    switch (scheduleType) {
        case 1:
            this.schedule = new Schedule1(machineArr, 2, 8, pkn, pkc1);
            this.weeklySchedule = new WeeklySchedule(this.schedule, numOfDays);
            break;
        case 2:
            this.schedule = new Schedule2(machineArr, 2, 8, pkn, pkc1);
            this.weeklySchedule = new WeeklySchedule(this.schedule, numOfDays);
            break;
        case 3:
            this.schedule = new Schedule3(machineArr, 2, 8, pkn, pkc1);
            this.weeklySchedule = new WeeklySchedule(this.schedule, numOfDays);
            break;
        default:
            console.log('no schedule given');

    }
    // this.weeklySchedule = new WeeklySchedule(this.schedule, 6);

    this.dailySales = function(pkoPrice, pkc2Price) {
        return {
            pkoSales: fc.schedule.pkoAfterSecondPress * pkoPrice,
            pkcSales: fc.schedule.pkc2AfterSecondPress * pkc2Price,
            totalSales: fc.schedule.pkoAfterSecondPress * pkoPrice + fc.schedule.pkc2AfterSecondPress * pkc2Price
        }
    }

    this.weeklySales = function(pkoPrice, pkc2Price) {
        var sales = fc.dailySales(pkoPrice, pkc2Price);
        return sales.totalSales * numOfDays
    }
    
    this.netRevenue = function() {
        return fc.weeklySales(PKO_PRICE, PKC2_PRICE) - this.overallWeeklyCost();
    }

    this.overallWeeklyCost = function() {
        return fc.nepaWeeklyCost() + fc.genWeeklyCost() + fc.weeklyCarCost() + fc.weeklySalary() + fc.rawMaterialCost();
    }

    this.nepaWeeklyCost = function() {
        return NEPA * 16 * NEPA_HOURLY * numOfDays;
    }

    this.genWeeklyCost = function() {
        return GEN * 16 * GEN_HOURLY * numOfDays;
    }

    this.weeklyPower = function() {
        return fc.nepaWeeklyCost() + fc.genWeeklyCost();
    }

    this.weeklyCarCost = function() {
        return CAR_RENTAL;
    }

    this.weeklySalary = function() {
        return ((WORKER * 6)+ (MECHANIC * 2) + (PRODUCTION * 2) + (SECURITY)) / 4;
    }

    this.rawMaterialCost = function() {
        return pkn * numOfDays * PKN_PRICE;
    }
}

// 64 loops for the entire shift
// for every 15minutes, calc how much pkn crush and how much pko and pkc1 produced
// after first loop, feed machine2 with pkc1 produced from machine1
// what are the global variables?


function DailySimulator (pkn, pkc1, macbrk) {
    var pknCounter = initialPkn = pkn;
    var pkoCounter = 0;
    var pkc1Counter = pkc1 || 0;
    var pkc2Counter = 0;
    
    var pknToPkc1 = 0.55;
    var pknToPko = 0.35
    var pkc1ToPko = 0.09;
    var pkc1ToPkc2 = 0.95;

    var prefixArr = ['', 'st hour', 'nd hour', 'rd hour'];
    
    var m1cap = 0.625; // how much pkn/pkc1 machine1 can process every hour
    var m2cap = 0.41666667; // how much pkn/pkc1 machine2 can process every hour

    var mac1Online = true;
    var mac2Online = true;

    var machineWillBreak, whichMachine, breakSeverity, timeOfBreakage;

    var fixtime = fixtime1 = fixtime2 = 0;
    console.log(macbrk, 'breakage object');

    if(macbrk.machineWillBreak) {
        machineWillBreak = macbrk.machineWillBreak;
        whichMachine = macbrk.whichMachine;
        breakSeverity = macbrk.breakSeverity;
        timeOfBreakage = macbrk.timeOfBreakage;
        console.log('machine ' + whichMachine + ' broke down in the ' + timeOfBreakage + 'hour');
    } else {
        console.log('No machines broke down');
    }

    

    for (var i = 1; i <= 16; i++) {
        if(i === timeOfBreakage) {
            if(breakSeverity === 'low') {
                fixtime = 1;
            } else if(breakSeverity === 'mid') {
                fixtime = 2;
            } else {
                fixtime = 4;
            }

            if(whichMachine === 'both') {
                mac1Online = false; 
                mac2Online = false;
                fixtime1 = fixtime2 = fixtime;
            } else if(whichMachine === 1) {
                mac1Online = false;
                fixtime1 = fixtime;
            } else {
                mac2Online = false;
                fixtime2 = fixtime;
            }


            console.log('machine ' + whichMachine + ' broke down in the ' + timeOfBreakage + 'hour and it will take ' + fixtime + ' hour to fix');
        }

        if (fixtime1 === 0) {
            mac1Online = true;
        } 
        if(fixtime2 === 0) {
            mac2Online = true;
        }

        // if(pkc1Counter >= m2cap) {
        //     console.log('machine 2 doing second press at ' + i, i < 4 ? prefixArr[i] : 'th' + ' hour');
        //     pkoCounter += (m2cap * pkc1ToPko);
        //     pkc2Counter += (m2cap * pkc1ToPkc2);
    
        //     pkc1Counter -= m2cap;
        // } else {
        //     console.log('machine 2 doing first press at ' + i, i < 4 ? prefixArr[i] : 'th' + ' hour')
        //     if(pknCounter >= m2cap) {
        //         pknCounter -= m2cap;
        //         pkoCounter += (m2cap * pknToPko);
        //         pkc1Counter += (m2cap * pknToPkc1);              
        //     }

        // }
        if(mac2Online && fixtime2 === 0) {
            if(pkc1Counter > m2cap) {
                console.log('machine 2 doing second press at ' + i, i < 4 ? prefixArr[i] : 'th' + ' hour');
                pkoCounter += (m2cap * pkc1ToPko);
                pkc2Counter += (m2cap * pkc1ToPkc2);
        
                pkc1Counter -= m2cap;
            }
            //  else if(pkc1Counter >= m2cap){
            //     console.log('machine 2 doing first press at ' + i, i < 4 ? prefixArr[i] : 'th' + ' hour')
            //     pknCounter -= m2cap;
            //     pkoCounter += (m2cap * pknToPko);
            //     pkc1Counter += (m2cap * pknToPkc1);
            // } 
            else {
                console.log('machine 2 doing first press at ' + i, i < 4 ? prefixArr[i] : 'th' + ' hour')
                pknCounter -= m2cap;
                pkoCounter += (m2cap * pknToPko);
                pkc1Counter += (m2cap * pknToPkc1);
            }
        } else {
            console.log('On the ' + i + 'th hour, fixing machine 2, ' + fixtime2 + ' hours left')
            fixtime2--;
        }

        if(mac1Online && fixtime1 === 0) {
            if(pknCounter >= m1cap) {
                pknCounter -= m1cap;
                pkoCounter += (m1cap * pknToPko);
                pkc1Counter += (m1cap * pknToPkc1); 
            } else {
                pknCounter -= pknCounter;
                pkoCounter += (pknCounter * pknToPko);
                pkc1Counter += (pknCounter * pknToPkc1); 
                console.log("pkn finished at the " + i + "th hour");
                break;
            }
        } else {
            console.log('On the ' + i + 'th hour, fixing machine 1, ' + fixtime1 + ' hours left');
            fixtime1--;
        }
    
    }


    var sales = (pkoCounter * 350000) + (pkc2Counter * 40000);
    var pknCrushed = initialPkn - pknCounter;

    return {    
        pknCrushed,
        pknCounter,
        pkoCounter,
        pkc1Counter,
        pkc2Counter,
        sales
    }
}

function WeeklySimulator(days, totalPkn) {
    var dailySim, macbrk, weeklyPko = weeklyPkc1 = weeklyPkn = weeklyPkc2 = weeklySales = 0;
    var weeklyProductionCost = 8100000 + 36500 + 140024 + 157500;
    var cashIn = 0;
    for (var i = 1; i <= days; i++) {
        if(weeklyPkc1 === 0) {
            macbrk = new machineBreakage();
            dailySim = new DailySimulator(totalPkn, weeklyPkc1, macbrk);
            weeklyPko += dailySim.pkoCounter;
            weeklyPkc1 = dailySim.pkc1Counter;
            weeklyPkc2 += dailySim.pkc2Counter;
            totalPkn = dailySim.pknCounter;
            weeklySales += dailySim.sales;
        } else {
            macbrk = new machineBreakage();
            dailySim = new DailySimulator(totalPkn, weeklyPkc1, macbrk);
            weeklyPko += dailySim.pkoCounter;
            weeklyPkc1 = dailySim.pkc1Counter;
            weeklyPkc2 += dailySim.pkc2Counter;
            totalPkn = dailySim.pknCounter;
            weeklySales += dailySim.sales;
        }

        // if we have enough pko or pkc2 (min sale qty set to 10T) to sell, Sell it!
        if(weeklyPko >= 10 ) {
            var cashed = 10 * PKO_PRICE;
            cashIn += cashed;
            weeklyPko -= 10;
            console.log('We are cashing in ' + cashed +' from PKO on day ' + i + ' total cash in: ' + cashIn);
        } else if(weeklyPkc2 >= 10) {
            var cashed = 10 * PKC2_PRICE;
            cashIn += cashed
            weeklyPkc2 -= 10;
            console.log('We are cashing in ' + cashed +' from PKC2 on day ' + i + ' total cash in: ' + cashIn);
        }

        console.log('Day ' + i + ' summary');
        console.log('pkn crushed: ' + dailySim.pknCrushed + '\n' + 'pkn left: ' + dailySim.pknCounter + '\n' + 'pkc1 left: ' + dailySim.pkc1Counter + '\n' + 'pkc2 produced: ' + dailySim.pkc2Counter + '\n' + 'pko produced : ' + dailySim.pkoCounter + '\n' + 'sales: ' + dailySim.sales + '\n');
        console.log('Weekly cummulative summary');
        console.log('pkn left: ' + totalPkn + '\n' + 'pkc1 left: ' + weeklyPkc1 + '\n' + 'pkc2 produced: ' + weeklyPkc2 + '\n' + 'pko produced: ' + weeklyPko + '\n' + 'sales: ' + weeklySales + '\n');
    }

    var netRevenue = weeklySales - weeklyProductionCost;
    var netCashIn = cashIn - weeklyProductionCost;

    return {
        weeklyPko,
        weeklyPkc1,
        weeklyPkc2,
        weeklySales,
        netRevenue,
        netCashIn,
        cashIn
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function machineBreakage () {
    // will machine break
    // likelihood of machine breaking 25%
    // if option0, no machine will break (75%)
    // if option1, machine will break (25%)

    // which machine will break
    // if option1, machine1 will break (50%)
    // if option2, machine2 will break (40%)
    // if option3, both machine will break (10%)
    
    // severity of breakage
    // if option1, severity low - will take 30mins - 1hr (60%)
    // if option2, severity mid - will take 1 - 2hrs (30%)
    // if option3, severity hi - will take 2 - 4hrs (10%)

    var a = Math.random(), //probability of machine breaking in a day
        b = Math.random(), //probability for checking which of the machine is broken
        c = Math.random(), //probability of the severity of the breakage
        timeOfBreakage = getRandomInt(1, 16);

    var machineWillBreak, whichMachine, breakSeverity;

    if(a < 0.35) {
        machineWillBreak = true;
    } else {
        machineWillBreak = false;
    }

    if (machineWillBreak) {
        if(b < 0.4) {
            whichMachine = 2;
        } else if(b < 0.9) {
            whichMachine = 1
        } else {
            whichMachine = 'both';
        }

        if(c < 0.6) {
            breakSeverity = 'low';
        } else if(c < 0.9) {
            breakSeverity = 'mid';
        } else {
            breakSeverity = 'hi';
        }
        
        return {
            machineWillBreak,
            whichMachine,
            breakSeverity,
            timeOfBreakage
        }

    } else {
        return {
            machineWillBreak
        }
    }

}
