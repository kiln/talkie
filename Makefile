export TALKIE_MAJOR_VERSION=1.0
export TALKIE_VERSION=1.0.2
export TALKIE_UI_VERSION=1.0

UGLIFY=node_modules/uglify-js/bin/uglifyjs
UGLIFY_OPTS=-m -c

LESSC=node_modules/less/bin/lessc
LESSC_OPTS=

.PHONY: all clean demos publish publish-demos

all: talkie-$(TALKIE_MAJOR_VERSION).js talkie-$(TALKIE_MAJOR_VERSION).min.js talkie.css

clean:
	@rm -f talkie-$(TALKIE_VERSION).js talkie-$(TALKIE_VERSION).min.js

demos:
	./demos.sh

publish: all
	scp talkie-$(TALKIE_VERSION)*.js kiln:kiln.it/
	ssh kiln 'cd kiln.it && ln -sf talkie-$(TALKIE_VERSION).js talkie-$(TALKIE_MAJOR_VERSION).js && ln -sf talkie-$(TALKIE_VERSION).min.js talkie-$(TALKIE_MAJOR_VERSION).min.js'
	scp talkie.css kiln:kiln.it/talkie/ui/$(TALKIE_UI_VERSION)/
	scp images/* kiln:kiln.it/talkie/ui/$(TALKIE_UI_VERSION)/images/

publish-demos: publish demos
	bin/publish-demos

talkie-$(TALKIE_VERSION).js: src/core.js src/events.js src/maps.js src/ui.js src/slider.js src/animation.js src/timeline.js src/jquery.js
	./build.sh $^ > $@.tmp && mv $@.tmp $@

talkie-$(TALKIE_MAJOR_VERSION).js: talkie-$(TALKIE_VERSION).js
	@ln -sf talkie-$(TALKIE_VERSION).js talkie-$(TALKIE_MAJOR_VERSION).js

talkie-$(TALKIE_MAJOR_VERSION).min.js: talkie-$(TALKIE_VERSION).js
	@ln -sf talkie-$(TALKIE_VERSION).min.js talkie-$(TALKIE_MAJOR_VERSION).min.js

%.min.js: %.js
	$(UGLIFY) $(UGLIFY_OPTS) -- $^ > $@

%.css: %.less
	$(LESSC) $(LESSC_OPTS) $< $@
