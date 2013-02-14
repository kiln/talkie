UGLIFY=node_modules/uglify-js/bin/uglifyjs
UGLIFY_OPTS=-m -c

LESSC=node_modules/less/bin/lessc
LESSC_OPTS=

.PHONY: all clean demos publish

all: talkie-1.0.js talkie-1.0.min.js examples/style.css

clean:
	@rm -f talkie-1.0.js talkie-1.0.min.js

demos:
	./demos.sh

publish: all
	scp talkie-1.0*.js kiln:kiln.it/

talkie-1.0.js: src/core.js src/events.js src/jquery.js src/maps.js src/slider.js src/animation.js src/timeline.js
	./build.sh $^ > $@.tmp && mv $@.tmp $@

%.min.js: %.js
	$(UGLIFY) $(UGLIFY_OPTS) -- $^ > $@

%.css: %.less
	$(LESSC) $(LESSC_OPTS) $< $@
