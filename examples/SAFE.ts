
export = function(inputJSON: Common) {
    // standard linter doesn't like the js that tsc produces from this:
    // let [ControlJSON, guessedSpecies] = guessSpecies(inputJSON);    
    // let [validationError, validationRv] = validate(guessedSpecies, ControlJSON, inputJSON);
    // so doing it the verbose way:
    let temp1 = guessSpecies(inputJSON);
    let ControlJSON = temp1[0];
    let guessedSpecies = temp1[1];
    let temp2 = validate(guessedSpecies, ControlJSON, inputJSON); // should be either a Cap, Discount, CapDiscount, or MFN -- can typescript do that?    
    let validationError = temp2[0];
    let validationRv = temp2[1];        
    if (validationError) {
        throw Error("VALIDATION ERROR: " + validationRv);
    }
    else {
        return myAssign(ControlJSON, inputJSON);
    }
}


interface Common {
    "Change of Control Voting Block Threshold": string, // percentage string, ends with %
    "Company Legal Form": string,
    "Company Name": string,
    "Governing Law Jurisdiction": string,
    "Investor Name": string,
    "Purchase Amount": string,
    "Purchase Date": string, // can we fromJSON this into a Date?
    "Time Notice is Effective after Deposit in the Mail": string,
    "Discount Rate": string | undefined,
    "Valuation Cap": string | undefined
}

interface Cap extends Common { "Valuation Cap": string }
interface Discount extends Common { "Discount Rate": string }
type CapDiscount = Cap | Discount
interface MFN extends Common { "Equity Financing Purchase Price Threshold": string }

interface ControlJSON {
    Cap: boolean,
    Discount: boolean,
    CapDiscount: boolean,
    MFN: boolean
}

enum Species { Cap, Discount, CapDiscount, MFN }

function nonzero(input: string): boolean {
    return Number(input.replace(/[^\d.]/g, "")) > 0;
}

function myAssign<O1, O2>(obj1: O1, obj2: O2): O1 | O2 {
    const rv = {} as O1 | O2;
    Object.getOwnPropertyNames(obj2).forEach((name) => {
        (rv as any)[name] = (obj2 as any)[name];
    });
    Object.getOwnPropertyNames(obj1).forEach((name) => {
        (rv as any)[name] = (obj1 as any)[name];
    });

    return rv;
}

function guessSpecies(userJSON: Common): [ControlJSON, Species] {
    let controlJSON: ControlJSON = {
        Cap: false,
        Discount: false,
        CapDiscount: false,
        MFN: false
    };

    let discountRate = userJSON["Discount Rate"];
    if (discountRate && nonzero(discountRate)) controlJSON.Discount = true;
    let cap = userJSON["Valuation Cap"];
    if (cap && nonzero(cap)) controlJSON.Cap = true;

    let species: Species;

    if (controlJSON.Discount && controlJSON.Cap) {
        species = Species.CapDiscount
        controlJSON.CapDiscount = true
    }
    else if (controlJSON.Discount) { species = Species.Discount }
    else if (controlJSON.Cap) { species = Species.Cap }
    else {
        species = Species.MFN
        controlJSON.MFN = true
    }

    return [controlJSON, species]
}

function validate(species: Species, controljson: ControlJSON, userjson: Common): [boolean, string] {
    // does typescript approve of the JSON object?
    // or should we be using http://json-schema.org/
    return [false, "this is fine."];
}

