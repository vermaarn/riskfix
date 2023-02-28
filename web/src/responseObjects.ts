import { IAnnotation, PredictionScores, ValidatedScores } from "icu-validation-ui/dist/types"

const INTERVAL = 30 * 1000

export const fetchAnnotationRes: IAnnotation = {
    "annotation": [
        "significant pallor of the nail beds observed",
        "signi",
        "significant pal",
        "baseline indicates that vitals are expected"
    ],
    "timestamp": [
        1677267447950,
        1677267421283,
        1677267348108,
        1677267315633
    ]
}

export const fetchValidationRes: ValidatedScores = {
        "rounded_timestamp": [
            "1677602940000"
        ],
        "validated_risk_score": [
            "0.50"
        ]
}


export const fetchPredictioRes: PredictionScores = {
    "averages": [
        0.5281829982995987,
        0.5285736719767252,
        0.5285124182701111,
        0.5286454955736796,
        0.5293663740158081,
        0.5293518702189127,
        0.5296014149983724,
        0.5299329857031504,
        0.5299284259478251,
        0.529871384302775
    ],
    "last_scores": [
        0.52838,
        0.529239,
        0.529005,
        0.529235,
        0.529789,
        0.530347,
        0.530206,
        0.530259,
        0.530191,
        0.530565
    ],
    "scores": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
    ],
    "times": [
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL)  ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 1) ).toString() ,
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 2) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 3) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 4) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 5) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 6) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 7) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 8) ).toString(),
        ((Math.floor(new Date().getTime() / (INTERVAL) ) * INTERVAL) - (INTERVAL * 9) ).toString(),
       
    ]
}