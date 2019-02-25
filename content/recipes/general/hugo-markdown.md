+++
categories = ["recipes"]
tags = ["[CODE]"]
summary = "Recipe Summary"
title = "Hugo Markdown"
date = 2018-09-26T10:43:51-05:00
+++

## Links

```
[like this](http://someurl "this title shows up when you hover")
```

[like this](http://someurl "this title shows up when you hover")

## Artifact Links

```
[MyWikiPage](/recipes/general/12-factor-app)
```

[MyWikiPage](/recipes/general/12-factor-app)

## Basic Text Formatting

```
*this is in italic*  and _so is this_

**this is in bold**  and __so is this__

***this is bold and italic***  and ___so is this___
```

*this is in italic*  and _so is this_

**this is in bold**  and __so is this__

***this is bold and italic***  and ___so is this___

* * *

```
<s>this is strike through text</s>
```

<s>this is strike through text</s>

* * *

```
> Use it if you're quoting a person, a song or whatever.
```

## Tables

```
First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell
```

First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell

## Images

```
![tiny arrow](https://sourceforge.net/images/icon_linux.gif "tiny arrow")
```

![tiny arrow](https://sourceforge.net/images/icon_linux.gif "tiny arrow")

## Lists

```
* an asterisk starts an unordered list
* and this is another item in the list
+ or you can also use the + character
- or the - character

To start an ordered list, write this:

1. this starts a list *with* numbers
+  this will show as number "2"
*  this will show as number "3."
9. any number, +, -, or * will keep the list going.
    * just indent by 4 spaces (or tab) to make a sub-list
        1. keep indenting for more sub lists
    * here i'm back to the second level
    <br>
    here's some more content under this level

To start a check list, write this:

- [ ] this is not checked
- [ ] this is too
- [x] but this is checked
```

* an asterisk starts an unordered list
* and this is another item in the list
+ or you can also use the + character
- or the - character

To start an ordered list, write this:

1. this starts a list *with* numbers
+  this will show as number "2"
*  this will show as number "3."
9. any number, +, -, or * will keep the list going.
    * just indent by 4 spaces (or tab) to make a sub-list
        1. keep indenting for more sub lists
    * here i'm back to the second level
    <br>
    here's some more content under this level

To start a check list, write this:

- [ ] this is not checked
- [ ] this is too
- [x] but this is checked
