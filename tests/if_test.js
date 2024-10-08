const Slimo = require("../src/Slimo"); 
const {customDeepEqual,toSafeString} = require("./util"); 

describe("Flow Parser", function() {

  it("should parse flow with no statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
          "version": 1,
          "threshold": 5000
      },
      "steps": [],
      "index": {},
      "exitSteps": [
        null
      ]
    };
    
    const flows = Slimo.parse(flowText);
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
  it("should parse flow with 1 DO statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        DO Yes`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "DO Yes",
          "rawMsg": "DO Yes",
          "nextStep": [],
          "index": 0,
          "type": ""
        }
      ],
      "index": {
        "0": "Point to step 0: DO Yes"
      },
      "exitSteps": [
        "Point to step 0: DO Yes"
      ]
    }
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();

  });
  it("should parse flow with different indentation on same level", function() {
    const flowText = `
        FLOW: Sample flow 1
        version: 1.0
        threshold: 5000
        IF cond
          DO No
        DO Yeah`;
    const expectedSteps = [
      {
        "msg": "cond",
        "rawMsg": "cond",
        "nextStep": [
          {
            "msg": "DO No",
            "rawMsg": "DO No",
            "nextStep": [
              {
                "msg": "DO Yeah",
                "rawMsg": "DO Yeah",
                "nextStep": [],
                "index": 2,
                "type": ""
              }
            ],
            "index": 1,
            "type": ""
          },
          "Point to step 2: DO Yeah"
        ],
        "index": 0,
        "type": "IF"
      }
    ]
    const expectedExitSteps = [
      "Point to step 2: DO Yeah"
    ]
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0].steps,expectedSteps)).toBeTrue();
    expect(customDeepEqual(flows["Sample flow 1"][0].exitSteps,expectedExitSteps)).toBeTrue();

  });
  it("should parse flow with 1 IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF condition
          DO Yes
        `;
    const expected = {
        "name": "Sample flow 1",
        "headers": {},
        "steps": [
          {
            "msg": "condition",
            "rawMsg": "condition",
            "nextStep": [
              {
                "msg": "DO Yes",
                "rawMsg": "DO Yes",
                "nextStep": [],
                "index": 1,
                "type": ""
              }
            ],
            "index": 0,
            "type": "IF"
          }
        ],
        "index": {
          "0": "Point to step 0: IF condition",
          "1": "Point to step 1: DO Yes"
        },
        "exitSteps": [
          "Point to step 1: DO Yes",
          "Point to step 0: IF condition"
        ]
      }
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
  it("should parse flow with IF ELSE statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF 2 
          IF 1
            DO A
          ELSE
            DO B
        `;
    const expected = {
      "name": "Sample flow 1",
      "headers": {},
      "steps": [
        {
          "msg": "2",
          "rawMsg": "2",
          "nextStep": [
            {
              "msg": "1",
              "rawMsg": "1",
              "nextStep": [
                {
                  "msg": "DO A",
                  "rawMsg": "DO A",
                  "nextStep": [],
                  "index": 2,
                  "type": ""
                },
                {
                  "msg": "DO B",
                  "rawMsg": "DO B",
                  "nextStep": [],
                  "index": 4,
                  "type": ""
                }
              ],
              "index": 1,
              "type": "IF"
            }
          ],
          "index": 0,
          "type": "IF"
        }
      ],
      "index": {
        "0": "Point to step 0: IF 2",
        "1": "Point to step 1: IF 1",
        "2": "Point to step 2: DO A",
        "3": {
          "nextStep": [],
          "index": 3,
          "type": "ELSE"
        },
        "4": "Point to step 4: DO B"
      },
      "exitSteps": [
          "Point to step 2: DO A",
          "Point to step 4: DO B",
          "Point to step 0: IF 2"
        ]
    }
    
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
  it("should parse flow with nested IF statement", function() {
    const flowText = `
        FLOW: Sample flow 1
        IF condition 1
          IF condition 2
            DO Yes
        DO No
        `;
    const expected = [
      {
        "msg": "condition 1",
        "rawMsg": "condition 1",
        "nextStep": [
          {
            "msg": "condition 2",
            "rawMsg": "condition 2",
            "nextStep": [
              {
                "msg": "DO Yes",
                "rawMsg": "DO Yes",
                "nextStep": [
                  {
                    "msg": "DO No",
                    "rawMsg": "DO No",
                    "nextStep": [],
                    "index": 3,
                    "type": ""
                  }
                ],
                "index": 2,
                "type": ""
              },
              "Point to step 3: DO No"
            ],
            "index": 1,
            "type": "IF"
          },
          "Point to step 3: DO No"
        ],
        "index": 0,
        "type": "IF"
      }
    ]
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0].steps,expected)).toBeTrue();
  });
  it("should parse flow with IF ELSE_IF and ELSE statements", function() {
    const flowText = `
FLOW: Sample flow 1
version: 1.0
threshold: 5000
DO A
IF condition 1
  DO C
ELSE_IF condition 2
  DO K
ELSE
  DO D
DO E`;
    const expected = {
      "name": "Sample flow 1",
      "headers": {
        "version": 1,
        "threshold": 5000
      },
      "steps": [
        {
          "msg": "DO A",
          "rawMsg": "DO A",
          "nextStep": [
            {
              "msg": "condition 1",
              "rawMsg": "condition 1",
              "nextStep": [
                {
                  "msg": "DO C",
                  "rawMsg": "DO C",
                  "nextStep": [
                    {
                      "msg": "DO E",
                      "rawMsg": "DO E",
                      "nextStep": [],
                      "index": 7,
                      "type": ""
                    }
                  ],
                  "index": 2,
                  "type": ""
                },
                {
                  "msg": "condition 2",
                  "rawMsg": "condition 2",
                  "nextStep": [
                    {
                      "msg": "DO K",
                      "rawMsg": "DO K",
                      "nextStep": [
                        "Point to step 7: DO E"
                      ],
                      "index": 4,
                      "type": ""
                    },
                    {
                      "msg": "DO D",
                      "rawMsg": "DO D",
                      "nextStep": [
                        "Point to step 7: DO E"
                      ],
                      "index": 6,
                      "type": ""
                    }
                  ],
                  "index": 3,
                  "type": "ELSE_IF"
                }
              ],
              "index": 1,
              "type": "IF"
            }
          ],
          "index": 0,
          "type": ""
        }
      ],
      "index": {
        "0": "Point to step 0: DO A",
        "1": "Point to step 1: IF condition 1",
        "2": "Point to step 2: DO C",
        "3": "Point to step 3: ELSE_IF condition 2",
        "4": "Point to step 4: DO K",
        "5": {
          "nextStep": [
            "Point to step 7: DO E"
          ],
          "index": 5,
          "type": "ELSE"
        },
        "6": "Point to step 6: DO D",
        "7": "Point to step 7: DO E"
      },
      "exitSteps": [
        "Point to step 7: DO E"
      ]
    }
    
    const flows = Slimo.parse(flowText);
    // console.log(toSafeString(flows["Sample flow 1"]));
    // console.log(JSON.stringify(flows["Sample flow 1"], null, 4));
    expect(customDeepEqual(flows["Sample flow 1"][0],expected)).toBeTrue();
  });
});

