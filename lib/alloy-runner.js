'use babel';

import Java from 'java';
import { CompositeDisposable, Emitter } from 'atom';
import { extension, sleep } from './util';

export default class AlloyRunner {

    // Constructor
    constructor() {

        // Internal state
        this._is_java_running = false;
        this._needs_restart = false;
        this._jar = null;

        // Event things
        this._emitter = new Emitter();
        this.subscriptions = new CompositeDisposable();

    }

    initialize(jar) {
        this._setJar(jar);
        this._buildSubscriptions();
    }

    destroy() {
        if (this.subscriptions) this.subscriptions.dispose();
    }

    // Event subscriptions
    on_java_loading(callback) {
        return this._emitter.on('javaloading', callback);
    }

    on_java_ready(callback) {
        return this._emitter.on('javaready', callback);
    }

    on_needs_restart(callback) {
        return this._emitter.on('needsrestart', callback);
    }

    on_parse_commands(callback) {
        return this._emitter.on('commands', callback);
    }

    parse(editor) {
        if (this._is_java_running) {
            this.Parser.parseOneModule(editor.getText(), (error, result) => {
                this._onParse(editor, error, result);
            });
        }
    }

    // Private functions
    _buildSubscriptions() {

        // Watch the config for changes to the alloy location
        this.subscriptions.add(
            atom.config.observe('alloy.jar', (jar) => {
                this._setJar(jar);
            })
        );

    }

    _initializeJavaEnvironment(jar) {

        try {

            // Imports
            this.Parser = Java.import('edu.mit.csail.sdg.alloy4compiler.parser.CompUtil');
            this.Execute = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod');
            this.Options = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');

            // Instances
            this.options = Java.newInstanceSync('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');
            this.options.solver = this.Options.SatSolver.SAT4J;

            // Java is ready
            // Dev: add sleep so that we can be sure the loading page works
            sleep(500).then(() => {
                this._onJavaReady();
            });

            // this._onJavaReady();

        }

        catch (error) {

            this._is_java_running = false;
            this._needsRestart('error');

        }
    }

    _needsRestart(reason) {
        this._needs_restart = true;
        this._emitter.emit('needsrestart', reason);
    }

    _onJavaReady() {
        this._is_java_running = true;
        this._needs_restart = false;
        this._emitter.emit('javaready');
    }

    _onParse(editor, error, result) {
        if (error) {

        } else {
            this._emitter.emit('commands', {
                editor: editor,
                commands: result.getAllCommandsSync().toArraySync()
            });
        }
    }

    _setJar(jar) {

        if (jar !== this._jar) {

            if (this._is_java_running) {

                this._needsRestart('newjar');
                return;

            }

            if (jar !== 'none' && extension(jar) === 'jar') {

                // Initialize java
                this._emitter.emit('javaloading');
                this._jar = jar;
                Java.classpath.push(jar);
                Java.ensureJvm(() => this._initializeJavaEnvironment(jar));
            }
        }
    }



    visualize(error, result) {
        // if (error) {
        //     console.log(e);
        // } else {
        //     console.log(result.satisfiableSync());
        //     let filename = '/home/tristan/Desktop/test.xml';
        //     result.writeXML(filename);
        //     Java.newInstanceSync('edu.mit.csail.sdg.alloy4viz.VizGUI', false, filename, null, null, null);
        // }
    }

    execute(file, command) {

        // let command_string = command.toString();
        //
        // this.comp_util.parseEverything_fromFile(null, null, file, function(error, comp) {
        //
        //     let commands = comp.getAllCommandsSync().toArraySync();
        //     let command = commands.find(function(c) {
        //         return c.toString() === command_string;
        //     });
        //
        //     if (command) {
        //         this.translate.execute_command(
        //             null,
        //             comp.getAllReachableSigsSync(),
        //             command,
        //             this.options,
        //             this.visualize
        //         )
        //     } else {
        //         // Do some error handling here
        //     }
        //
        // }.bind(this));

    }

    parsed(error, result) {
        // if (error) {
        //     this._emitter.emit('syntaxerr', error);
        // } else {
        //     this._emitter.emit('commands', result.getAllCommandsSync().toArraySync());
        //     this._emitter.emit('signatures', result.getAllReachableSigsSync().toArraySync());
        // }
    }

    onSignaturesAvailable(callback) {
        // this._emitter.on('signatures', callback);
    }

    onSyntaxError(callback) {
        // this._emitter.on('syntaxerr', callback);
    }

    on_compile(error, result) {
        // if (error) {
        //     console.log(error);
        // } else {
        //     let commands = result.getAllCommandsSync().toArraySync();
        //     let c = commands[0];
        //     console.log(c.toString());
        //     this.translate.execute_command(
        //         null,
        //         result.getAllReachableSigsSync(),
        //         c,
        //         this.options,
        //         function(e, r) {
        //             if (e) {
        //                 console.log(e);
        //             } else {
        //                 let filename = '/home/tristan/Desktop/test.xml';
        //                 r.writeXML(filename);
        //                 Java.newInstanceSync('edu.mit.csail.sdg.alloy4viz.VizGUI', false, filename, null, null, null);
        //             }
        //         }
        //     );
        // }
    }

}
