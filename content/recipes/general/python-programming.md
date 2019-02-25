+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Python Programming"
date = 2018-10-22T19:42:34-05:00
+++

## Getting Started

### Create Simple Python Program

Create a file with the following code and save into a `.py` file.

```Python
print('Interest Calculator:')
amount = float(input('Principal amount ?'))
roi = float(input('Rate of Interest ?'))
years = int(input('Duration (no. of years) ?'))
total = (amount * pow(1 + (roi/100), years))
interest = total - amount
print('\nInterest = %0.2f' %interest)
```

### Execute Program

```
python ./{name}.py
```

### Execute Python Shell

```
idle
```

## Python Basics

### Keywords

**Enter commands:**

1. idle
1. help()
1. keywords

**Output:**

```
and                 elif                if                  print
as                  else                import              raise
assert              except              in                  return
break               exec                is                  try
class               finally             lambda              while
continue            for                 not                 with
def                 from                or                  yield
del                 global              pass
```

### Lists and Loops

```Python
L3 = [1, "Hello", 3.4]
for iter in L3:
    print(iter)
```

## Building Python Applications

1. Define `requirements.txt` or `setup.py` file.
1. Define `manifest.yml` file.
