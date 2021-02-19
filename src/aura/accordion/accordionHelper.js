({
    init: function(cmp) {
        cmp.set('v.privateSectionBag', {});
        cmp.set('v.privateSortedSections', []);
        cmp.set('v.privateSelectedSectionId');
        cmp.set('v.privateIsOpenProgrammatically', false);
    },

    handleSectionRegister: function(cmp, event) {
        var details = event.detail;
        var sections = cmp.get('v.privateSectionBag');

        event.stopPropagation();

        sections[details.targetId] = {
            id: details.targetId,
            name: details.targetName,
            ref: details.element,
            open: details.openSection,
            close: details.closeSection,
            focus: details.focusSection
        };

        this.updateSortedSections(cmp, sections);
    },

    handleSectionDeregister: function(cmp, event) {
        var details = event.detail;
        var sectionBag = cmp.get('v.privateSectionBag');
        var selectedSection = cmp.get('v.privateSelectedSectionId');

        event.stopPropagation();

        if (details.targetId === selectedSection && Object.keys(sectionBag).length > 1) {
            this.openNextSection(cmp, sectionBag[selectedSection]);
        }

        delete sectionBag[details.targetId];
        this.updateSortedSections(cmp, sectionBag);
    },

    openSection: function(cmp, section, isProgrammatically) {
        var sectionBag = cmp.get('v.privateSectionBag');
        var selectedSectionId = cmp.get('v.privateSelectedSectionId');

        if (section.id !== selectedSectionId) {
            if (selectedSectionId) {
                sectionBag[selectedSectionId].close();
            }

            section.open();

            cmp.set('v.privateSelectedSectionId', section.id);
            cmp.set('v.privateIsOpenProgrammatically', !!isProgrammatically && section.name !== cmp.get('v.activeSectionName'));
            cmp.set('v.activeSectionName', section.name);
        }
    },

    getNextSection: function(cmp, section, reverseDirection) {
        var orderedSections = cmp.get('v.privateSortedSections');
        var direction = !!reverseDirection ? -1 : 1;
        var nextSectionIndex = this.getOrderedIndexOfBy(cmp, function(sectionInfo) {
            return sectionInfo.section.id === section.id;
        });

        if (nextSectionIndex < 0) {
            return undefined;
        }

        nextSectionIndex = nextSectionIndex + direction;

        if (nextSectionIndex === orderedSections.length) {
            nextSectionIndex = 0;
        } else if (nextSectionIndex < 0) {
            nextSectionIndex = orderedSections.length - 1;
        }

        return nextSectionIndex;
    },

    openNextSection: function(cmp, section, reverseDirection) {
        var orderedSections = cmp.get('v.privateSortedSections');
        var nextSectionIndex = this.getNextSection(cmp, section, reverseDirection);

        if (nextSectionIndex !== undefined) {
            this.openSection(cmp, orderedSections[nextSectionIndex].section, true);
        }
    },

    openSectionWithName: function(cmp, sectionName) {
        var section = this.getSectionByName(cmp, sectionName);

        if (section) {
            this.openSection(cmp, section);
        } else if (sectionName) {
            $A.warning('There\'s no section with the name "' + sectionName + '".');
        }
    },

    openSectionAfterRender: function(cmp) {
        var sectionByName = this.getSectionByName(cmp, cmp.get('v.activeSectionName'));

        if (sectionByName) {
            this.openSection(cmp, sectionByName);
        } else {
            $A.warning('The first section is now the default expanded section because the activeSectionName specified wasn\'t valid.');

            var orderedSections = cmp.get('v.privateSortedSections');
            if (orderedSections.length > 0) {
                this.openSection(cmp, orderedSections[0].section, true);
            }
        }
    },

    updateSortedSections: function(cmp, sectionBag) {
        var sectionsIds = Object.getOwnPropertyNames(sectionBag);
        var sortedSections = [];
        var allSectionsInAccordion = cmp.getElement().querySelectorAll('li.slds-accordion__list-item');

        for (var i = 0; i < sectionsIds.length; i = i + 1) {
            sortedSections.push({
                rank: Array.prototype.indexOf.call(allSectionsInAccordion, sectionBag[sectionsIds[i]].ref),
                section: sectionBag[sectionsIds[i]]
            });
        }

        sortedSections.sort(function(sectionA, sectionB) {
            if (sectionA.rank === sectionB.rank) {
                return 0;
            }

            return sectionA.rank < sectionB.rank ? -1 : 1;
        });

        cmp.set('v.privateSortedSections', sortedSections);
    },

    getOrderedIndexOfBy: function(cmp, searchFunction) {
        var orderedSections = cmp.get('v.privateSortedSections');
        var i = 0;

        while (i < orderedSections.length && !searchFunction(orderedSections[i])) {
            i = i + 1;
        }

        return i >= orderedSections.length ? -1 : i;
    },

    getSectionByName: function(cmp, sectionName) {
        var orderedSections = cmp.get('v.privateSortedSections');
        var i = this.getOrderedIndexOfBy(cmp, function(sectionInfo) {
            return sectionInfo.section.name === sectionName;
        });

        return !sectionName || i < 0 ? null : orderedSections[i].section;
    },

    handleSectionKeyNav: function(cmp, event) {
        var keyCodes = this.utilsLibrary.keyCodes;
        var keyCode = event.detail.keyCode;
        var isReverseDirection = keyCode === keyCodes.left || keyCode === keyCodes.up;
        var sectionBag = cmp.get('v.privateSectionBag');
        var selectedSectionId = event.detail.targetId;
        var orderedSections = cmp.get('v.privateSortedSections');

        event.stopPropagation();
        var nextSectionIndex = this.getNextSection(cmp, sectionBag[selectedSectionId], isReverseDirection);
        if (nextSectionIndex !== undefined) {
            orderedSections[nextSectionIndex].section.focus();
        }
    },

    handleSectionSelect: function(cmp, event) {
        var sectionBag = cmp.get('v.privateSectionBag');

        event.stopPropagation();
        if (sectionBag.hasOwnProperty(event.detail.targetId)) {
            this.openSection(cmp, sectionBag[event.detail.targetId], true);
        }
    },

    handleActiveSectionNameChange: function(cmp) {
        if (!cmp.get('v.privateIsOpenProgrammatically')) {
            this.openSectionWithName(cmp, cmp.get('v.activeSectionName'));
        }

        cmp.set('v.privateIsOpenProgrammatically', false);
    },
})
