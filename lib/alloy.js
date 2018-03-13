'use babel';

// Libraries
import Java from 'java';

// Atom
import { Emitter } from 'atom';

export default function alloy () {

    let _is_java_loading = false,
        _is_java_running = false,
        _jar = null;

    let _Parser = null,
        _Execute = null,
        _Options = null,
        _Reporter = null,
        _options = null;

    let _emitter = new Emitter();

    let _alloy = {};

    _alloy.compile = function (file, callback) {
        if (_is_java_running && _Parser) {
            try {
                _Parser.parseEverything_fromFile(
                    null,       // Reporter
                    null,       // File cache
                    file,       // File to be parsed
                    callback    // Callback to be called when finished compiling
                );
            }
            catch (error) {
                callback(error);
            }
        } else {
            callback('Java not running');
        }
    }

    _alloy.dispose = function () {
        _emitter.dispose();
        return _alloy;
    }

    _alloy.execute = function (sigs, command, callback) {
        if (_is_java_running && _Execute) {
            try {

                let cmd = command.command();

                function cb (error, result) {
                    callback(command, error, result);
                }

                _Execute.execute_command(
                    null,       // Reporter
                    sigs,       // Complete list of sigs
                    cmd,    // The command to execute
                    _options,   // Alloy options
                    cb          // Callback to be called when finished running
                );
            }
            catch (error) {
                callback(item, error);
            }
        }
    }

    _alloy.jar = function (jar) {

        if (!arguments.length) return _jar;

        // Only allow the jar to be set once
        if (_jar) {
            _emitter.emit('warning',
                'The alloy.jar file has been changed. In order for changes to take effect, Atom must be reloaded.'
            );
        }

        // Make sure we're looking at a jar file
        if (!jar.split('.').pop() === 'jar') {
            _emitter.emit('error',
                'The Alloy jar file must have a .jar extension.'
            );
        }

        // Make sure we aren't already in the process of loading Java
        // and Java isn't already running
        if (!_is_java_loading && !_is_java_running) {

            // Let everyone know we're loading Java
            _is_java_loading = true;
            _emitter.emit('loading');

            // Set the jar and load the JVM
            _jar = jar;
            Java.classpath.push(_jar);
            Java.ensureJvm(_load_java);

        }

        return _alloy;

    }

    _alloy.on_java_loading = function (callback) {

        if (_is_java_loading) return callback(), null;
        return _emitter.on('loading', callback);
    }

    _alloy.on_java_running = function (callback) {

        if (_is_java_running) return callback(), null;
        return _emitter.on('running', callback);
    }

    _alloy.on_warning = function (callback) {
        return _emitter.on('warning', callback);
    }

    _alloy.on_error = function (callback) {
        return _emitter.on('error', callback);
    }

    _alloy.parse = function (text, callback) {
        if (_is_java_running && _Parser) {
            try {
                _Parser.parseOneModule(text, callback);
            }
            catch (error) {
                callback(error);
            }
        }
    }

    function _load_java () {

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
            sleep(750).then(function () {

                _is_java_loading = false;
                _is_java_running = true;
                _emitter.emit('running');

            });

        }

        catch (error) {

            _is_java_loading = false;
            _is_java_running = false;
            _emitter.emit('error', error);

        }

    }

    return _alloy;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
