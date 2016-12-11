# hue-controller

A node+docker based controller image for more advanced scheduling and scenes.

## Intended Features

Here are some of the things I want to do, if time ever allows:

* Express-based UI for registering application

* Ability to create complex schedules using cron-like syntax

* Ability to create triggers based on smart-home events (e.g. Amazon Echo)

* Conditional execution:

  * only set scheme IF room is already on
  * only set scheme if lights have not changed since previous time

* Externalised state - volume or dynamodb 

## Installation

For now, it is neccesary to manually register the application and store configuration in environment variables.

