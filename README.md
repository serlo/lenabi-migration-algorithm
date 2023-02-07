# Migration Algorithm for Serlo Editor Content Format

*M.2.2. Ein Migrationsalgorithmus für das Speicher- und Austauschformat ist implementiert. (Dieser ermöglicht, dass parallel neue Lerninhalte für den Editor entwickelt werden können und Lerninhalte im Speicher- und Austauschformat standardisiert werden können.)*

## Introduction

No software is set in stone. There will always be the need to add or change features. But doing these changes shouldn't make existing content inacessible. As a fairly youn project, the Serlo Editor will undergo a lot of developments in the foreseeable future, so we have to prepare for changes in the format of the content we store.

## Overview

To ensure backwards-compatibility, the Serlo Editor will use a built-in migration algorithm. Every document has a field that defines the current version of the format. The version number is an integer starting from 1. Everytime a breaking-change is made to the format, the version increases by 1. In addition, there will be a function provided that takes a document from version `n - 1` and converts it to a valid file of version `n`:



