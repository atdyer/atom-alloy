'use babel';

import Java from 'java';
import {
    CompositeDisposable,
    Emitter
} from 'atom';
import { extension } from './util';

export default class AlloyRunner {

    // Constructor
    constructor() {

        // Event things
        this.emitter = new Emitter();
        this.subscriptions = new CompositeDisposable();
        this.buildSubscriptions();

        // Old stuff
        Java.classpath.push('/home/tristan/Downloads/Software/Alloy/alloy4.2_2015-02-22.jar');
        this.comp_util = Java.import('edu.mit.csail.sdg.alloy4compiler.parser.CompUtil');
        this.translate = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod');
        this.Options = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');

        this.options = Java.newInstanceSync('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');
        this.options.solver = this.Options.SatSolver.SAT4J;

    }

    destroy() {
        if (this.subscriptions) this.subscriptions.dispose();
    }

    buildSubscriptions() {

        // Watch the config for changes to the alloy location
        this.subscriptions.add(
            atom.config.observe('alloy.jar', (jar) => {
                this.setJar(jar);
            })
        );

    }

    setJar(jar) {

        this.emitter.emit('jarset', jar);

        // If java is initialized, shut it down

        if (extension(jar) === 'jar') {

            // Initialize java

        }
    }

    // Event subscriptions
    onJarSet(callback) {
        this.emitter.on('jarset', callback);
    }

    onJavaReady(callback) {
        this.emitter.on('javaready', callback);
    }

    // Private functions
    _onJavaReady() {
        this.emitter.emit('javaready');
    }



    visualize(error, result) {
        if (error) {
            console.log(e);
        } else {
            console.log(result.satisfiableSync());
            let filename = '/home/tristan/Desktop/test.xml';
            result.writeXML(filename);
            Java.newInstanceSync('edu.mit.csail.sdg.alloy4viz.VizGUI', false, filename, null, null, null);
        }
    }

    execute(file, command) {

        let command_string = command.toString();

        this.comp_util.parseEverything_fromFile(null, null, file, function(error, comp) {

            let commands = comp.getAllCommandsSync().toArraySync();
            let command = commands.find(function(c) {
                return c.toString() === command_string;
            });

            if (command) {
                this.translate.execute_command(
                    null,
                    comp.getAllReachableSigsSync(),
                    command,
                    this.options,
                    this.visualize
                )
            } else {
                // Do some error handling here
            }

        }.bind(this));

    }

    parse(file) {
        this.comp_util.parseOneModule(file, this.parsed.bind(this));
    }

    parsed(error, result) {
        if (error) {
            this.emitter.emit('syntaxerr', error);
        } else {
            this.emitter.emit('commands', result.getAllCommandsSync().toArraySync());
            this.emitter.emit('signatures', result.getAllReachableSigsSync().toArraySync());
        }
    }

    onCommandsAvailable(callback) {
        this.emitter.on('commands', callback);
    }

    onSignaturesAvailable(callback) {
        this.emitter.on('signatures', callback);
    }

    onSyntaxError(callback) {
        this.emitter.on('syntaxerr', callback);
    }

    on_compile(error, result) {
        if (error) {
            console.log(error);
        } else {
            let commands = result.getAllCommandsSync().toArraySync();
            let c = commands[0];
            console.log(c.toString());
            this.translate.execute_command(
                null,
                result.getAllReachableSigsSync(),
                c,
                this.options,
                function(e, r) {
                    if (e) {
                        console.log(e);
                    } else {
                        let filename = '/home/tristan/Desktop/test.xml';
                        r.writeXML(filename);
                        Java.newInstanceSync('edu.mit.csail.sdg.alloy4viz.VizGUI', false, filename, null, null, null);
                    }
                }
            );
        }
    }

}
