'use babel';

// Libraries
import Java from 'java';
import temp from 'temp';

// Utilities
import { extension, sleep } from './util';

// Atom
import { CompositeDisposable, Emitter } from 'atom';


export default function alloy_runner () {

    let _is_java_running = false,
        _needs_restart = false,
        _jar = null;

    let _Parser = null,
        _Execute = null,
        _Options = null,
        _options = null;

    let _emitter = new Emitter(),
        _subscriptions = new CompositeDisposable();

    let _alloy_runner = {};


    _alloy_runner.dispose = function () {
        _subscriptions.dispose();
        return _alloy_runner;
    }

    _alloy_runner.execute = function (file, command) {

        if (_is_java_running) {

            function visualize (error, result) {

                console.log(result);
                console.log(result.nextSync());
                return;

                if (!error) {

                    let filename = temp.path({suffix: '.xml'});
                    result.writeXML(filename);
                    Java.newInstance(
                        'edu.mit.csail.sdg.alloy4viz.VizGUI',
                        false,
                        filename,
                        null, null, null,
                        function (err, inst) {
                            console.log(err);
                            console.log(inst);
                        }
                    );

                } else {

                    console.error(error);

                }

            }

            // First we need to compile the file that
            // the command lives in. Create the callback
            // that is called once parsing is complete,
            // and then begin parsing.
            function on_parse_complete (error, comp_module) {

                if (!error) {

                    let commands = comp_module.getAllCommandsSync().toArraySync();
                    let cmd = commands.find(function (c) {
                        return c.toString() === command.toString();
                    });

                    if (cmd) {

                        _Execute.execute_command(
                            null,
                            comp_module.getAllReachableSigsSync(),
                            cmd,
                            _options,
                            visualize
                        );

                    } else {

                        console.error('Command not found in file');

                    }

                } else {
                    console.error(error);
                }

            }

            _Parser.parseEverything_fromFile(null, null, file, on_parse_complete);

        } else {

            // TODO: Inform the user that java isn't running
            console.log('Cannot run command ' + command.toString());
            console.log('Java is not running.')

        }

    }

    _alloy_runner.jar = function (jar) {

        if (!jar) return _jar;

        // The jar is being changed
        if (jar !== _jar) {

            // If java is already running, raise a warning
            // that atom must restart in order for the JVM
            // to be reloaded.
            if (_is_java_running) {

                return _set_needs_restart('newjar');

            }

            // Make sure we're looking at a jar file
            if (extension(jar) === 'jar') {

                // Let everyone know we're loading the JVM
                // and then go ahead and start loading it
                _emitter.emit('javaloading');
                _jar = jar;
                Java.classpath.push(_jar);
                Java.ensureJvm(_initialize_java_environment);

                // Now that we've set the jar once, let's
                // listen for changes to the jar created
                // by the user changing settings.
                _subscriptions.dispose();
                _subscriptions.add(
                    atom.config.observe('alloy.jar', _alloy_runner.jar)
                );

            }

        }

        return _alloy_runner;
    }

    _alloy_runner.on_commands_parsed = function (callback) {
        return _emitter.on('commandsparsed', callback);
    }

    _alloy_runner.on_java_loading = function (callback) {
        return _emitter.on('javaloading', callback);
    }

    _alloy_runner.on_java_ready = function (callback) {
        return _emitter.on('javaready', callback);
    }

    _alloy_runner.on_needs_restart = function (callback) {
        return _emitter.on('needsrestart', callback);
    }

    _alloy_runner.parse = function (editor) {

        if (_is_java_running && _Parser) {
            _Parser.parseOneModule(editor.getText(), function (error, result) {
                _on_commands_parsed(editor, error, result);
            });
        }

        return _alloy_runner;

    }

    _alloy_runner.dispose = function () {
        _subscriptions.dispose();
    }

    function _create_alloy_runner () {

        return _alloy_runner;
    }

    function _on_commands_parsed (editor, error, result) {

        if (error) {
            console.log('Error parsing, this is where to implement highlighting');
        } else {
            _emitter.emit('commandsparsed', {
                editor: editor,
                commands: result.getAllCommandsSync().toArraySync()
            });
        }

    }

    function _initialize_java_environment () {

        try {

            // Import classes that have static methods
            _Parser = Java.import('edu.mit.csail.sdg.alloy4compiler.parser.CompUtil');
            _Execute = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod');
            _Options = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');

            // Create instances of classes that aren't static
            _options = Java.newInstanceSync('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');
            _options.solver = _Options.SatSolver.SAT4J;

            // At this point, the JRE is ready
            // TODO: Make sure this sleep is commented out
            //       for production. It's there to test page
            //       transitions.
            sleep(750).then(_set_java_ready);
        }

        catch (error) {

            _is_java_running = false;
            _set_needs_restart('error:import');
            console.log(error);

        }

    }

    function _set_java_ready () {

        _is_java_running = true;
        _needs_restart = false;
        _emitter.emit('javaready');

    }

    function _set_needs_restart (reason) {

        _needs_restart = true;
        _emitter.emit('needsrestart', reason);

    }

    return _create_alloy_runner();

}
