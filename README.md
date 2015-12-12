# Mogritare

Interfaces for web scrapers that hierarchically collect data through 
selector-based event emitters.

## Overview

We will use Watson’s [Concept Insights][0] to stitch DOM Elements together 
by event emitters for conceptually spaced extraction.

## Read-only scrape

1. $ node index.js

## Goals

1. https://new.infofree.com/login
2. Implement automated CasperJS with CSS or XSL.

## Schema: Domains

We load a domain (./domains.json):

    {
      "loginUrl" : "https://domain.com/login",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "baseUrl" : "http://domain.com/",
      "credentials": {
        "username" : "",
        "password" : ""
      }
    }

## Schema: Conf (TODO)

We load JSON schemas for each Domain Schema:

    {
      '$$'     : engine,
      strategy : 'artoo',
      content  : __xmlString,
      selector : 'ul > li',
      params   : null,
      pre      : 'span'
    }

### Conf Layout

    $$        engine is going to contain a copy of the engine used specified in 
              @strategy.
    strategy  ‘artoo’ or ‘jquery’
    content   Promise-loaded HTML document that corresponds to a request flow 
              specified in the Domain Schema.
    selector  The selector corresponding to HTML document markup captured.
    params    (tbd)
    pre       runs a “pre-selection” with the engine before the selector is 
              selected, were a syntax is to be developed to relate pre and 
              normal selections such that they might be grouped, intersected, 
              etc. in the retrieval-extraction process output

## Bluemix

Install cf:

    curl -L "https://cli.run.pivotal.io/stable?release=macosx64-binary&source=github" | tar -zx

Review https://github.com/watson-developer-cloud/concept-insights-nodejs
Login https://idaas.ng.bluemix.net/idaas/index.jsp

[0]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/concept-insights.html

## Other stuff

![Mogritare](https://raw.githubusercontent.com/nerdfiles/mogritare/master/gem-dragon.jpg)

Mogritare is a Gem Dragon. She is a competitive rival to Aonstrri her cousin 
Rattelyr Dragon.
