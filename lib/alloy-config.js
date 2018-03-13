'use babel';

export default {
    jar: {
        title: 'Alloy Jar Location',
        description: 'The location of the **alloy.jar** file. [Click here](http://alloytools.org/download.html) to download.',
        type: 'string',
        default: 'none'
    },
    solver: {
        title: 'SAT Solver',
        description: 'Set the SAT solver to use when running models.',
        type: 'string',
        default: 'SAT4J',
        enum: [
            'BerkMinPIPE',
            'CNF',
            'KK',
            'MiniSatJNI',
            'MiniSatProverJNI',
            'SAT4J',
            'SpearPIPE',
            'ZChaffJNI'
        ]
    }
};
