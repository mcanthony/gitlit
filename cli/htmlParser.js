/**
 * Created by Devon Timaeus on 10/1/2014.
 *
 * Updated by John Kulczak on 10/2/2014.
 */

var Parser = require('parse5').Parser;
var parser = new Parser();

var modes = require('js-git/lib/modes');
var repo = {};
var treeHash = {};
require('js-git/mixins/mem-db')(repo);
require('js-git/mixins/create-tree')(repo);

function printOutFiles(fileContents, path, repoName) {
    var dom = parser.parse(fileContents);
    if (dom.nodeName == '#document') {
        /*
         We are at the top-most layer, so we need to make the top-most directory
         and then go through and add the files to it.
         */
        var dirName = path + generateDirectoryName(repoName, 0) + "/";

		fs.mkdir(dirName, function(err){
			if (err) {
				console.log(err);
			} else {
				// Initialize the repo
				treeHash = repo.createTree({
					dirName: {
						mode: modes.tree}});
				
				console.log("Created the directory: \"%s\"", dirName);
			}
		});

        dispatchChildrenProcessing(dom, dirName);

        // After processing children, we need to write our metadata file and return
        //TODO: Write Metadata file

		// Create a test commit
		var commitHash = repo.saveAs("commit", {
    		author: {
      		name: "John Kulczak",
      		email: "j_kulczak@hotmail.com"
   	 	},
    		tree: treeHash,
    		message: "Test commit\n"
  		});
    } else {
        // There was some problem parsing, as the top-level should be the #document
        throw new TypeError("Error in parsing file: top-level #document not created");
    }
}

function generateFileName(tagID, counter) {
    /*
        If present, use the tag's ID for the filename, otherwise just
        generate something
     */
    if (tagID) {
        return tagID + ".txt";
    } else {
        return counter + ".txt";
    }
}

function generateDirectoryName(tagID, counter) {
    /*
     If present, use the tag's ID for the filename, otherwise just
     generate something
     */
    if (tagID) {
        return tagID
    } else {
        return counter
    }
}

function writeToFile(path, contents) {
	fs.writeFile(path, contents, function(err){
		if (err) {
			console.log(err);
		} else {
			// Create a new blob for this file and add it to the repo tree
			var changes = [
				{
					path: path,
					mode: modes.file,
					content: contents }];

			changes.base = treeHash;
			treeHash = repo.createTree(changes);

			console.log("Wrote the following to file \"%s\"", path);
    		console.log(contents);
		}
	});
}

function processTaglessChild(dom, path, childNumber) {
    /*
     If we don't have a tag, then there is more to be done here, as
     we might be in a text node (a node that has raw text that was in
     the parent node), or something else. Otherwise, since we have the
     tag, we can just process the children and move on.
     */
    var fileDirName = path + generateFileName(null, childNumber);
    var contents = null;
    if (dom.nodeName == "#text") {
        /*
         This means that we are in a node that is just a representation
         of raw text that was in the parent node, so we just need to make
         a file for this and put the contents in it.
         */
        contents = dom.value;
    } else if (dom.nodeName == '#documentType') {
        /*
         This means that we've found the opening DOCTYPE tag, we'll want
         to do something with this, probably just store it and move on.
         */
        contents = dom.name;
    }
    if (contents != null) {
        writeToFile(fileDirName, contents);
    }
    return fileDirName
}

function processTaggedChild(dom, path, childNumber) {
    var id = null;
    var tag = dom.tagName;
    var attributes = null;

    if (typeof dom.attrs != 'undefined') {
        attributes = dom.attrs;
    }
    for (att in attributes) {
        if (attributes[att].name == 'id'){
            id = attributes[att].value;
            break;
        }
    }

    var dirName = path + generateDirectoryName(id, childNumber) + "/";

	fs.mkdir(dirName, function(err){
		if (err) {
			console.log(err);
		} else {
			// Add this directory to the repo tree
			var changes = [
				{
					path: path,
					mode: modes.tree }];

			changes.base = treeHash;
			treeHash = repo.createTree(changes);

			console.log("Created the directory: \"%s\"", dirName);
    		console.log("tag was:" + tag);
		}
	});

    var children = dispatchChildrenProcessing(dom, dirName);
    // After processing children, we need to write our metadata file and return
    //TODO: Write Metadata file
    var fs = require("fs");
    var metaFileJson = {
    	tag: tag,
    	attributes: attributes,
    	constructionOrder: children
    }
    fs.writeFile("metadata.json", JSON.stringify(metaFileJson), "utf8", function(err){
		if (err) {
			console.log(err);
		} else {
			console.log("Wrote the following to file \"%s\"", path);
    		console.log(contents);
		}
	});
    return dirName
}

function dispatchChildrenProcessing(dom, path) {
	var children = [];
    for (var child in dom.childNodes) {
        if (typeof dom.childNodes[child].tagName == 'undefined') {
            children.push(processTaglessChild(dom.childNodes[child], path, child));
        } else {
            children.push(processTaggedChild(dom.childNodes[child], path, child));
        }
    }
    return children
}

module.exports = {
    printOutFiles: printOutFiles
};
