VERSION=1.0

UGLIFY=node_modules/uglify-js/bin/uglifyjs
UGLIFY_OPTS=-m -c

LESSC=node_modules/less/bin/lessc
LESSC_OPTS=

.PHONY: all clean demos publish

all: talkie-$(VERSION).js talkie-$(VERSION).min.js examples/style.css

clean:
	@rm -f talkie-$(VERSION).js talkie-$(VERSION).min.js

demos:
	./demos.sh

publish: all
	scp talkie-$(VERSION)*.js kiln:kiln.it/
	scp images/* kiln:kiln.it/talkie/ui/$(VERSION)/

talkie-1.0.js: src/core.js src/events.js src/jquery.js src/maps.js src/slider.js src/animation.js src/timeline.js
	./build.sh $^ > $@.tmp && mv $@.tmp $@

%.min.js: %.js
	$(UGLIFY) $(UGLIFY_OPTS) -- $^ > $@

%.css: %.less
	$(LESSC) $(LESSC_OPTS) $< $@
