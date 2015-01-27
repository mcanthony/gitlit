function getGitDiffOutput(repoLocation) {
    if(granule.fileInfo.changeType == 'added') {
        return {changeType: 'added', objectID: granule.fileInfo.newID,

        if('attributes' in granule.versions.old) {
            granule.versions.old.attributes.forEach(function (attribute) {
                if (attribute.name == 'por-id') {
                    oldID = attribute.value;
                }
            });
        }

        if('attributes' in granule.versions.new) {
            granule.versions.new.attributes.forEach(function (attribute) {
                if (attribute.name == 'por-id') {
                    newID = attribute.value;
                }
            });
        }
    var oldPathParent = null;
    if(splitOld.length != 0) {
        oldPathParent = splitOld[splitOld.length-2];
    }

    var newPathParent = null;
    if(splitNew.length != 0) {
        newPathParent = splitNew[splitNew.length-2];
    }

        if(first == null) {
            //This almost certainly means that the topmost level metadata file
            //was edited, so we should just return null, since there IS no parent
            return null;
        }
    } else if (first == mightBeNull && mightBeNull != null) {
        {type: "added", pattern: /(new file mode)/g},
    getGitDiffOutput: getGitDiffOutput,