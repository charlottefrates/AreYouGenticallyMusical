// genetic markers to illustrate musical predosposition
let musicalMarkers = ["rs4630083", "rs13146789", "rs4349633", "rs3803"];

// pre-determined effect weights for our genotypes
let variantWeights = {
    rs4630083: {
        GG: 2.24,
        AG: 1.32,
        AA: 0
    },
    rs13146789: {
        TT: 1.0,
        TG: 0.82,
        GG: 0
    },
    rs4349633: {
        AA: 1.11,
        AG: 0,
        GG: 0
    },
    rs3803: {
        AA: 0.65,
        AG: 0,
        GG: 0
    }
}

// pre-determined musical scale
let musicalScale = {
    0: "Cat Walking On A Piano",
    1: "It's barely music",
    2: "Chops enough for 'Chopsticks'",
    3: "Honor-band Status",
    4: "Professional Musician",
    5: "Beethoven Prodigy"
}

// commits API response to memory
let userData;

// user cURL endpoint
let corsAvoidance = "https://cors-anywhere.herokuapp.com/";
let userUrl = "https://api.23andme.com/3/account/";
let userquery = corsAvoidance + userUrl

// genetic marker cURL endpoint
let baseUrl = "https://api.23andme.com/3/profile/demo_profile_id/marker/";
let markerquery = corsAvoidance;

//request to get user information
let firstRequest = {
    "async": true,
    "crossDomain": true,
    "url": userquery,
    "method": "GET",
    "headers": {
        "Authorization": "Bearer demo_oauth_token",
        "Cache-Control": "no-cache",
        "content-type": "application/json",
        "cache-control": "no-cache"
    }
}

//request to get marker data
let markerRequests = {
    "async": true,
    "crossDomain": true,
    "url": markerquery,
    "method": "GET",
    "headers": {
        "Authorization": "Bearer demo_oauth_token",
        "Cache-Control": "no-cache",
        "content-type": "application/json",
        "cache-control": "no-cache"
    }

}

// handles API response promises
class TwentyThreeAndMeClient {
    constructor() {}

    getUserDataPromise() {
    return $.ajax(firstRequest).done(function (response) {
        userData = response.data;
    })

    }

    getVariantDataPromiseMap(markerList) {
        let variantDataPromiseMap = new Map();

        for (let i = 0; i < markerList.length; i++) {
            let newBaseUrl = baseUrl.concat(markerList[i]);
            let newMarkerquery = markerquery + newBaseUrl
            markerRequests.url = newMarkerquery;

            let reponsePromise = $.ajax(markerRequests);

            // Maps the variant string to the variant data retrieved from the API. 
            // It should look something like:
            // variantData["rs4630083"] = <response_object_promise>
            // variantData["rs13146789"] = <response_object_promise>
            // variantData["rs4349633"] = <response_object_promise> 
            // variantData["rs3803"] = <response_object_promise> 
            // myMap.set(key, value);
            variantDataPromiseMap.set(markerList[i], reponsePromise);
        }

        return variantDataPromiseMap;
    }
};

// handles promises and determines client's musical aptitude
class MusicalAptitudeProcessor {
    constructor(apiClient, markersOfInterest) {
        this.apiClient = apiClient;
        this.markersOfInterest = markersOfInterest;
    }

    // full genetic analysis on musical ability
    execute() {
        // variantDataPromiseMap is a map from each markersOfInterest to an API repsonse (note: returns line 91/110)
        let variantDataPromiseMap = this.apiClient.getVariantDataPromiseMap(this.markersOfInterest);
        // We generate an array of the keys in the variantDataPromiseMap (the variants of interest).
        let markerDataMapKeys = Array.from(variantDataPromiseMap.keys());
        // Using the keys we put the promises in an array in the same order as the array of keys. Each array value is an object from response
        let markerDataPromiseValues = [];

        for (var i = 0; i < markerDataMapKeys.length; i++) {
            // grabbing values associated with the key and adds it to markerDataPromiseValues
            //myMap.get(key) returns value of that key
            markerDataPromiseValues.push(variantDataPromiseMap.get(markerDataMapKeys[i]));
        }
        
        //method returns a single Promise that resolves when all of the promises in the iterable argument have resolved
        Promise.all(markerDataPromiseValues)
            .then((values) => {
                // values comes in the same order as markerDataPromiseValues. So we can
                // Construct a variantDataMap using the markerDataMapKeys from the map of
                // promises and the corresponding value in the same position.
                let variantDataMap = new Map();
                for (var i = 0; i < markerDataMapKeys.length; i++) {
                    variantDataMap.set(markerDataMapKeys[i], values[i]);
                }
                
                // with all mapping objects defined we then can call other methods to get desired results
                let variantAlleleMap = this.generateVariantAlleleMap(variantDataMap);
                let geneticScore = this.doTheMath(variantAlleleMap);
                let scoreScale = this.areYouMusical(geneticScore);
                let showResults = this.showResults(geneticScore, scoreScale,markerDataMapKeys.length);
            })
           

    }

    // grabs alleles from markers of interest and maps them
    generateVariantAlleleMap(variantDataMap) {
        //makes an array of the keys from variant map. Results in another array containing marker of interests.
        let variantDataMapKeys = Array.from(variantDataMap.keys());
        //makes a new map of alleles        
        let varaintAlleleMap = new Map();

        for (var i = 0; i < variantDataMapKeys.length; i++) {
            let targetVariant = variantDataMapKeys[i];

            // for target variant get me the response
            let apiResponse = variantDataMap.get(targetVariant);
            let alleles = "";
           
            for (var j = 0; j < apiResponse.variants.length; j++) {
                let targetAllele = apiResponse.variants[j].allele;
                let dosage = apiResponse.variants[j].dosage;
                // using dosage to determine how many times to add targetAllele to the alleles string
                for (var k = 0; k < dosage; k++) {
                    alleles += targetAllele;
                }
            }

            varaintAlleleMap.set(targetVariant, alleles);
        }
        return varaintAlleleMap;
    }

    // reverses alleles
    // "AT" is equivelent to "TA"
    reverseAllele(allele) {
        let reverse = "";
        for (let i = allele.length - 1; i >= 0; i--) {
            reverse += allele[i];
        }
        return reverse;
    }

    // take the mapped alleles and maps them to the given weights for final score
    doTheMath(varaintAlleleMap) {
        let variantAlleleMapKeys = Array.from(varaintAlleleMap.keys());
        let score = 0;

        for (var i = 0; i < variantAlleleMapKeys.length; i++) {
            //Results in another array containing marker of interests.
            let targetVariant = variantAlleleMapKeys[i];
            //grabs allele weights from global weight variable (line 5) based on marker of interest
            let weights = variantWeights[targetVariant];
            //grabs alleleMap value based on marker of interest
            let alleles = varaintAlleleMap.get(targetVariant);
            let reversedAlleles = this.reverseAllele(alleles);

            //matches the alleles to the marker's pre-defined allele weights
            let retrievedWeight = weights[alleles];
            let retrievedWeightFromReverse = weights[reversedAlleles];
            
            // if promise returns an undefined allele, meaning the alleles dont match for that marker
            //this function checks the reversed allele and compares it to variantWeight map
            //it then sums up the weights to a final score
            if (typeof retrievedWeight !== "undefined") {
                score += retrievedWeight;
            } else if (typeof retrievedWeightFromReverse !== "undefined") {
                score += retrievedWeightFromReverse;
            }
            // else do nothing
        }

        console.log(score);
        return score;
    }

    // maps score to musical ability scale
    areYouMusical(score) {
        let finalScore = Math.round(score);
        //matches the final score to global musical scale object to get final rating string
        let rating = musicalScale[finalScore];
        console.log(rating);
        return rating;
    }

    // injects findings to DOM
    showResults(score, rating,numVariants) {
        $("#numVar").text(numVariants);
        $('#finalScore').text(score);
        $('#rating').text(rating);
    }
};

/*----- Event handler -----*/
$("#button").on('click', function () {
    let apiClient = new TwentyThreeAndMeClient();
    apiClient.getUserDataPromise().then(function () {
        $('#userName').text(userData[0].first_name);
        $("#main").addClass('hidden');
        $("#report").removeClass('hidden');
    });;

    let processor = new MusicalAptitudeProcessor(apiClient, musicalMarkers);
    processor.execute();
});
