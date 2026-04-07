import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const courseRoot = path.join(process.cwd(), 'src/lib/server/course/python');

const chapters = [
	[
		'introduction',
		1,
		'Introduction',
		'Get comfortable reading Python code and printing output.',
		{ console: 5, quiz: 5, unit: 0 }
	],
	[
		'variables',
		2,
		'Variables',
		'Store values in names so your program can reuse and update them.',
		{ console: 6, quiz: 4, unit: 0 }
	],
	[
		'functions',
		3,
		'Functions',
		'Bundle code into reusable functions with inputs and outputs.',
		{ console: 6, quiz: 4, unit: 0 }
	],
	[
		'scope',
		4,
		'Scope',
		'Understand which variables exist in which parts of a program.',
		{ console: 5, quiz: 5, unit: 0 }
	],
	[
		'testing-and-debugging',
		5,
		'Testing and Debugging',
		'Use tests and careful debugging to fix problems with confidence.',
		{ console: 4, quiz: 3, unit: 3 }
	],
	[
		'computing',
		6,
		'Computing',
		'Connect Python code to the basic ideas that make computers work.',
		{ console: 3, quiz: 4, unit: 3 }
	],
	[
		'comparisons',
		7,
		'Comparisons',
		'Compare values and make decisions with boolean logic and if statements.',
		{ console: 4, quiz: 3, unit: 3 }
	],
	[
		'loops',
		8,
		'Loops',
		'Repeat work with loops instead of copying the same code over and over.',
		{ console: 4, quiz: 3, unit: 3 }
	],
	[
		'lists',
		9,
		'Lists',
		'Work with ordered collections of values using Python lists.',
		{ console: 3, quiz: 3, unit: 4 }
	],
	[
		'dictionaries',
		10,
		'Dictionaries',
		'Store and look up related data with key and value pairs.',
		{ console: 3, quiz: 3, unit: 4 }
	],
	[
		'sets',
		11,
		'Sets',
		'Use sets when you care about uniqueness and fast membership checks.',
		{ console: 3, quiz: 3, unit: 4 }
	],
	[
		'errors',
		12,
		'Errors',
		'Handle bad input and edge cases so your code behaves safely.',
		{ console: 4, quiz: 3, unit: 3 }
	],
	[
		'practice',
		13,
		'Practice',
		'Combine everything you have learned in slightly larger problems.',
		{ console: 3, quiz: 2, unit: 5 }
	],
	[
		'quiz',
		14,
		'Quiz',
		'Review the core Python ideas from the full course.',
		{ console: 0, quiz: 10, unit: 0 }
	]
].map(([slug, order, title, description, counts]) => ({ slug, order, title, description, counts }));

const q = (title, concept, question, choices, correctChoiceId = 'a') => ({
	title,
	concept,
	question,
	choices,
	correctChoiceId
});

const plans = {
	introduction: {
		console: [
			{
				kind: 'printText',
				title: 'Printing Your First Output',
				intro: '`print()` sends text to the console.',
				text: 'Welcome to Python!'
			},
			{
				kind: 'printLines',
				title: 'Printing Multiple Lines',
				intro: 'Use one `print()` call per line of output.',
				lines: ['Ready', 'Code']
			},
			{
				kind: 'printExpression',
				title: 'Printing Numbers and Math',
				intro: 'Python can evaluate a math expression before printing it.',
				expression: '4 + 6'
			},
			{
				kind: 'printLines',
				title: 'Reading Code Top to Bottom',
				intro: 'Python runs a file from top to bottom, so line order matters.',
				lines: ['Load', 'Aim', 'Fire']
			},
			{
				kind: 'printMixed',
				title: 'Mixing Text and Numbers',
				intro: 'Strings use quotes. Numbers do not.',
				values: ['"Level 1"', '2']
			}
		],
		quiz: [
			q(
				'Quiz: What `print()` Does',
				'`print()` shows a value in the console.',
				'What does `print("Mage")` do?',
				[
					{ id: 'a', label: 'It prints `Mage` to the console.' },
					{ id: 'b', label: 'It stores `Mage` in a variable.' },
					{ id: 'c', label: 'It returns `Mage` without displaying it.' },
					{ id: 'd', label: 'It checks whether `Mage` is already defined.' }
				]
			),
			q(
				'Quiz: Strings Use Quotes',
				'Strings are plain text wrapped in quotes.',
				'Which line uses a string literal correctly?',
				[
					{ id: 'a', label: 'print("Mage")' },
					{ id: 'b', label: 'print(Mage)' },
					{ id: 'c', label: 'print(Mage")' },
					{ id: 'd', label: 'print("Mage)' }
				]
			),
			q(
				'Quiz: Numbers vs Text',
				'A number and a string that looks like a number are different values.',
				'Which value would Python treat as a number?',
				[
					{ id: 'a', label: '7' },
					{ id: 'b', label: '"7"' },
					{ id: 'c', label: '"seven"' },
					{ id: 'd', label: '"007"' }
				]
			),
			q(
				'Quiz: Execution Order',
				'A simple Python file runs from top to bottom.',
				'What prints first here: `print("A")` then `print("B")`?',
				[
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' },
					{ id: 'c', label: 'Both on the same line at the same time.' },
					{ id: 'd', label: 'Nothing, because the second line replaces the first.' }
				]
			),
			q(
				'Quiz: Exact Output Matters',
				'Tests compare actual output to expected output.',
				'If the expected output is `Hello` but your code prints `hello`, what happens?',
				[
					{ id: 'a', label: 'The test fails because the output does not match exactly.' },
					{ id: 'b', label: 'The test still passes because Python ignores capitalization.' },
					{ id: 'c', label: 'Python automatically changes the output to match.' },
					{ id: 'd', label: 'Only spaces matter to the test, not letters.' }
				]
			)
		]
	},
	variables: {
		console: [
			{
				kind: 'varStorePrint',
				title: 'Storing a Value in a Variable',
				intro: 'A variable gives a value a name.',
				varName: 'hero_name',
				value: '"Ayla"'
			},
			{
				kind: 'varUpdate',
				title: 'Updating a Variable',
				intro: 'Variables can change over time.',
				varName: 'coins',
				start: 10,
				update: 'coins = coins + 5'
			},
			{
				kind: 'varCalc',
				title: 'Using Variables in Calculations',
				intro: 'Variables make calculations easier to read.',
				lines: [
					'base_damage = 12',
					'bonus_damage = 3',
					'total_damage = base_damage + bonus_damage'
				],
				output: 'total_damage'
			},
			{
				kind: 'varCalc',
				title: 'Printing Labels and Variables',
				intro: 'A label makes output easier to read.',
				lines: ['xp = 42', 'print("XP:")'],
				output: 'xp'
			},
			{
				kind: 'varReuse',
				title: 'Reusing a Variable',
				intro: 'Store a value once and use it more than once.',
				varName: 'role',
				value: '"wizard"',
				times: 2
			},
			{
				kind: 'varCalc',
				title: 'Calculating a Remaining Value',
				intro: 'Variables are useful for modeling changing state.',
				lines: ['potions = 8', 'used = 3', 'remaining = potions - used'],
				output: 'remaining'
			}
		],
		quiz: [
			q(
				'Quiz: What a Variable Is',
				'A variable stores a value so your program can reuse it.',
				'What is `score` doing in `score = 10`?',
				[
					{ id: 'a', label: 'Storing a value so the program can use it later.' },
					{ id: 'b', label: 'Comparing `score` to `10`.' },
					{ id: 'c', label: 'Calling a function named `score`.' },
					{ id: 'd', label: 'Printing `10` immediately.' }
				]
			),
			q(
				'Quiz: Valid Variable Names',
				'Variable names must follow Python’s naming rules.',
				'Which of these is the best valid Python variable name?',
				[
					{ id: 'a', label: 'player_level' },
					{ id: 'b', label: '2level' },
					{ id: 'c', label: 'player level' },
					{ id: 'd', label: 'player-level' }
				]
			),
			q(
				'Quiz: Assignment vs Equality',
				'`=` stores a value in a variable.',
				'What does `=` mean in `lives = 3`?',
				[
					{ id: 'a', label: 'Store the value 3 in the variable `lives`.' },
					{ id: 'b', label: 'Check whether `lives` is equal to 3.' },
					{ id: 'c', label: 'Add 3 to `lives`.' },
					{ id: 'd', label: 'Convert `lives` into a string.' }
				]
			),
			q(
				'Quiz: Updating a Variable',
				'Python can use the old value of a variable to compute a new one.',
				'After `coins = 10` and `coins = coins + 5`, what is stored in `coins`?',
				[
					{ id: 'a', label: '15' },
					{ id: 'b', label: '10' },
					{ id: 'c', label: '5' },
					{ id: 'd', label: '105' }
				]
			)
		]
	},
	functions: {
		console: [
			{
				kind: 'lenPrint',
				title: 'Calling a Built-in Function',
				intro: 'A function is a named tool that does a job for you.',
				text: 'sword'
			},
			{
				kind: 'definePrintFn',
				title: 'Defining and Calling a Function',
				intro: 'Defining a function gives a reusable block of code a name.',
				functionName: 'battle_cry',
				message: 'Charge!'
			},
			{
				kind: 'defineParamFnPrint',
				title: 'Functions With Parameters',
				intro: 'Parameters let a function receive input.',
				functionName: 'announce',
				paramName: 'name',
				body: ['print("Now entering:")', 'print(name)'],
				call: '"Ayla"'
			},
			{
				kind: 'defineReturnFnPrint',
				title: 'Returning a Value',
				intro: 'A function can return a value instead of printing it directly.',
				functionName: 'double',
				params: ['value'],
				returnExpr: 'value * 2',
				callArgs: ['6']
			},
			{
				kind: 'areaOfCircle',
				title: 'Using a Function to Reuse Code',
				intro:
					'Once a function knows how to do a calculation, you can call it with different inputs.'
			},
			{
				kind: 'defineReturnFnPrint',
				title: 'Functions With Multiple Inputs',
				intro: 'Functions can take more than one input.',
				functionName: 'total_damage',
				params: ['base', 'bonus'],
				returnExpr: 'base + bonus',
				callArgs: ['12', '3']
			}
		],
		quiz: [
			q(
				'Quiz: What a Function Is',
				'Functions let you reuse code instead of copying it everywhere.',
				'Why turn repeated code into a function?',
				[
					{ id: 'a', label: 'To reuse it instead of copying the same code everywhere.' },
					{ id: 'b', label: 'To store many values in order.' },
					{ id: 'c', label: 'To compare two values.' },
					{ id: 'd', label: 'To automatically run all code at startup.' }
				]
			),
			q(
				'Quiz: Parameters Are Inputs',
				'A parameter is a name that receives a value when a function is called.',
				'In `def greet(name):`, what is `name` called?',
				[
					{ id: 'a', label: 'A parameter.' },
					{ id: 'b', label: 'An argument.' },
					{ id: 'c', label: 'The function name.' },
					{ id: 'd', label: 'A return value.' }
				]
			),
			q(
				'Quiz: What `return` Means',
				'`return` sends a value back to the caller.',
				'What does `return 8` do inside a function?',
				[
					{ id: 'a', label: 'It sends `8` back to the caller.' },
					{ id: 'b', label: 'It prints `8` to the console.' },
					{ id: 'c', label: 'It stores `8` in a global variable.' },
					{ id: 'd', label: 'It runs the function 8 times.' }
				]
			),
			q(
				'Quiz: Calling a Function',
				'Defining a function creates it. Calling a function runs it.',
				'Which line calls a function named `wave`?',
				[
					{ id: 'a', label: 'wave()' },
					{ id: 'b', label: 'def wave():' },
					{ id: 'c', label: 'wave' },
					{ id: 'd', label: '"wave()"' }
				]
			)
		]
	},
	scope: {
		console: [
			{
				kind: 'scopeLocalPrint',
				title: 'Local Variables Live Inside Functions',
				intro: 'A variable created inside a function is local to that function.',
				functionName: 'show_message',
				localName: 'message',
				value: '"Local scope"'
			},
			{
				kind: 'scopeParamPrint',
				title: 'Parameters Belong to the Function',
				intro: 'Parameters are local to the function too.',
				functionName: 'greet',
				paramName: 'name',
				call: '"inside"'
			},
			{
				kind: 'scopeReturnPrint',
				title: 'Returning a Value Out of a Function',
				intro: 'A returned value can travel back to the caller.',
				functionName: 'build_label',
				localName: 'label',
				value: '"Knight"'
			},
			{
				kind: 'scopeTwoFns',
				title: 'Same Name, Different Function',
				intro: 'Different functions can each have their own local variable with the same name.'
			},
			{
				kind: 'scopeOuterRead',
				title: 'Reading a Value From Outside',
				intro:
					'A function can read an outer variable when it does not define its own variable with the same name.',
				outerName: 'theme',
				value: '"forest"',
				functionName: 'show_theme'
			}
		],
		quiz: [
			q(
				'Quiz: What Scope Means',
				'Scope describes where a variable name can be used.',
				"In Python, what does a variable's scope tell you?",
				[
					{ id: 'a', label: 'Where a variable name can be accessed in a program.' },
					{ id: 'b', label: 'What value the variable currently stores.' },
					{ id: 'c', label: 'What type the variable has.' },
					{ id: 'd', label: 'How long the file takes to run.' }
				]
			),
			q(
				'Quiz: Local Variables',
				'A local variable is created inside a function.',
				'If `message` is created inside `show_message()`, where can you usually use it?',
				[
					{ id: 'a', label: 'Inside `show_message()`.' },
					{ id: 'b', label: 'Anywhere in the same file.' },
					{ id: 'c', label: 'Inside any function with the same name.' },
					{ id: 'd', label: 'Anywhere after the function is called once.' }
				]
			),
			q(
				'Quiz: Getting a Value Out',
				'Use `return` to send a value back to the caller.',
				'Which keyword sends a value back out of a function?',
				[
					{ id: 'a', label: '`return`' },
					{ id: 'b', label: '`print`' },
					{ id: 'c', label: '`input`' },
					{ id: 'd', label: '`def`' }
				]
			),
			q(
				'Quiz: Same Name in Different Functions',
				'Two different functions can each have a local variable with the same name.',
				'Can two different functions both have a local variable named `count`?',
				[
					{ id: 'a', label: 'Yes, because each function has its own local scope.' },
					{ id: 'b', label: 'No, Python only allows one variable name per file.' },
					{ id: 'c', label: 'No, local variables must all be unique everywhere.' },
					{ id: 'd', label: 'Only if both variables store strings.' }
				]
			),
			q(
				'Quiz: Parameters and Scope',
				'A parameter behaves like a local variable filled in by the caller.',
				'In `def greet(name):`, which scope does `name` belong to?',
				[
					{ id: 'a', label: 'The function’s local scope.' },
					{ id: 'b', label: 'The caller’s local scope.' },
					{ id: 'c', label: 'Only the global scope.' },
					{ id: 'd', label: 'It has no scope until the function returns.' }
				]
			)
		]
	},
	'testing-and-debugging': {
		console: [
			{
				kind: 'printText',
				title: 'Fixing Exact Output Bugs',
				intro: 'Good debugging starts by comparing actual output to expected output carefully.',
				text: 'All tests passed'
			},
			{
				kind: 'varStorePrint',
				title: 'Fixing a Wrong Variable',
				intro: 'A small naming mistake can break working logic.',
				varName: 'lives',
				value: '9'
			},
			{
				kind: 'defineParamFnPrint',
				title: 'Fixing a Broken Function Call',
				intro: 'When debugging functions, check the function and the call site.',
				functionName: 'greet',
				paramName: 'name',
				body: ['print("Hello, " + name)'],
				call: '"Ada"'
			},
			{
				kind: 'printExpression',
				title: 'Fixing a Simple Calculation Bug',
				intro: 'A test failure on a number often means one tiny expression is wrong.',
				expression: '8 + 4'
			}
		],
		unit: [
			{
				kind: 'addConstant',
				title: 'Implementing a Small Tested Function',
				intro: 'Unit tests let you focus on one function at a time.',
				functionName: 'add_reward',
				param: 'points',
				amount: 5
			},
			{
				kind: 'isEven',
				title: 'Testing a Boolean Result',
				intro: 'Tests can verify boolean logic too.',
				functionName: 'is_even',
				param: 'value'
			},
			{
				kind: 'prefixString',
				title: 'Returning a Formatted String',
				intro: 'Tests are great at catching formatting mistakes.',
				functionName: 'format_item',
				param: 'name',
				prefix: 'Item: '
			}
		],
		quiz: [
			q(
				'Quiz: What a Test Gives You',
				'A test checks whether code behaves correctly for chosen inputs.',
				'What is a unit test for?',
				[
					{ id: 'a', label: 'Checking whether code works for chosen inputs.' },
					{ id: 'b', label: 'Making the code run faster automatically.' },
					{ id: 'c', label: 'Writing the function for you.' },
					{ id: 'd', label: 'Running the whole app for every possible input.' }
				]
			),
			q(
				'Quiz: Good Debugging Starts Small',
				'The fastest debugging usually starts with the smallest broken piece you can inspect.',
				'When a program fails, what is a good first step?',
				[
					{
						id: 'a',
						label: 'Check the smallest piece of code that should produce the result.'
					},
					{ id: 'b', label: 'Change several parts at once and see what happens.' },
					{ id: 'c', label: 'Skip the failing test and move on.' },
					{ id: 'd', label: 'Start by restyling the output.' }
				]
			),
			q(
				'Quiz: Exact Comparisons',
				'Tests compare actual results to expected results.',
				'Why do tests catch small output mistakes so well?',
				[
					{
						id: 'a',
						label: 'Because they compare the full actual output to the expected output.'
					},
					{ id: 'b', label: 'Because Python autocorrects small output mistakes.' },
					{ id: 'c', label: 'Because tests ignore case, spaces, and punctuation.' },
					{ id: 'd', label: 'Because printed strings always format themselves the same way.' }
				]
			)
		]
	},
	computing: {
		console: [
			{
				kind: 'printText',
				title: 'Bits Make Bytes',
				intro: 'Eight bits make one byte. This is foundational computing knowledge.',
				text: '8',
				raw: true
			},
			{
				kind: 'printExpression',
				title: 'Powers of Two',
				intro: 'Binary systems naturally connect to powers of two.',
				expression: '2 ** 5'
			},
			{
				kind: 'varCalc',
				title: 'Converting Kilobytes to Bytes',
				intro: 'A kilobyte is commonly treated as 1024 bytes in beginner computing lessons.',
				lines: ['kilobytes = 3', 'bytes_total = kilobytes * 1024'],
				output: 'bytes_total'
			}
		],
		unit: [
			{
				kind: 'convertBitsToBytes',
				title: 'Converting Bits to Bytes',
				intro: 'Package a unit conversion in a function.',
				functionName: 'bits_to_bytes',
				param: 'bits'
			},
			{
				kind: 'multiplyBy1024',
				title: 'Converting Kilobytes to Bytes',
				intro: 'A reusable conversion function is easier to read than repeated math.',
				functionName: 'kilobytes_to_bytes',
				param: 'kb'
			},
			{
				kind: 'compareAtLeastTwoArgs',
				title: 'Checking Available Memory',
				intro: 'Programs often compare required resources to available resources.',
				functionName: 'has_enough_memory',
				params: ['required', 'available'],
				compare: 'available >= required'
			}
		],
		quiz: [
			q(
				'Quiz: What a Bit Is',
				'A bit is one of the smallest units of digital information.',
				'What is a bit in computing?',
				[
					{ id: 'a', label: 'A small unit of digital information.' },
					{ id: 'b', label: 'A group of 8 bits.' },
					{ id: 'c', label: 'A decimal digit stored in memory.' },
					{ id: 'd', label: 'A Python value that can only be `True` or `False`.' }
				]
			),
			q(
				'Quiz: How Many Bits in a Byte',
				'The relationship between bits and bytes is worth memorizing.',
				'One byte is how many bits?',
				[
					{ id: 'a', label: '8' },
					{ id: 'b', label: '2' },
					{ id: 'c', label: '10' },
					{ id: 'd', label: '1024' }
				]
			),
			q(
				'Quiz: Powers of Two',
				'Binary systems naturally connect to powers of two.',
				'What does `2 ** 5` evaluate to?',
				[
					{ id: 'a', label: '32' },
					{ id: 'b', label: '10' },
					{ id: 'c', label: '25' },
					{ id: 'd', label: '64' }
				]
			),
			q(
				'Quiz: Why Abstractions Help',
				'A function can hide repeated details behind a clear name.',
				'Why put a conversion like kilobytes-to-bytes in a function?',
				[
					{ id: 'a', label: 'It gives repeated logic a clear reusable name.' },
					{ id: 'b', label: 'It changes the value of the conversion.' },
					{ id: 'c', label: 'It means you no longer need inputs.' },
					{ id: 'd', label: 'It turns the result into text automatically.' }
				]
			)
		]
	},
	comparisons: {
		console: [
			{
				kind: 'printComparison',
				title: 'A Comparison Produces a Boolean',
				intro: 'Comparison expressions answer yes-or-no questions.',
				comparison: '5 > 3'
			},
			{
				kind: 'ifBoolPrint',
				title: 'Using `if` With a Boolean',
				intro: '`if` runs code only when its condition is true.',
				setup: ['has_key = True'],
				condition: 'has_key',
				passText: 'Access granted'
			},
			{
				kind: 'ifElse',
				title: 'Using `if` and `else`',
				intro: '`else` gives you the other path.',
				setup: ['score = 7'],
				condition: 'score >= 10',
				passText: 'Win',
				failText: 'Keep going'
			},
			{
				kind: 'ifBoolPrint',
				title: 'Combining Conditions With `and`',
				intro: '`and` requires both conditions to be true.',
				setup: ['stamina = 12', 'has_sword = True'],
				condition: 'stamina >= 10 and has_sword',
				passText: 'Ready'
			}
		],
		unit: [
			{
				kind: 'compareAtLeast',
				title: 'Checking a Minimum Age',
				intro: 'Boolean helper functions keep decision logic readable.',
				functionName: 'is_old_enough',
				param: 'age',
				compare: 'age >= 18'
			},
			{
				kind: 'compareTwoArgs',
				title: 'Checking a Weight Limit',
				intro: 'Sometimes the rule is about staying at or below a maximum.',
				functionName: 'can_carry',
				params: ['weight', 'limit'],
				compare: 'weight <= limit'
			},
			{
				kind: 'isWeekend',
				title: 'Checking for Weekend Days',
				intro: '`or` is useful when more than one value counts as success.',
				functionName: 'is_weekend',
				param: 'day'
			}
		],
		quiz: [
			q(
				'Quiz: Comparison Results',
				'Comparison operators return booleans.',
				'What does `5 > 3` evaluate to?',
				[
					{ id: 'a', label: '`True`' },
					{ id: 'b', label: '`False`' },
					{ id: 'c', label: '`5`' },
					{ id: 'd', label: 'An error.' }
				]
			),
			q(
				'Quiz: `==` vs `=`',
				'`=` assigns a value. `==` compares values.',
				'Which operator checks whether two values are equal?',
				[
					{ id: 'a', label: '==' },
					{ id: 'b', label: '=' },
					{ id: 'c', label: '+=' },
					{ id: 'd', label: ':' }
				]
			),
			q(
				'Quiz: Meaning of `and`',
				'`and` is only true when both sides are true.',
				'What does `((True and True) or (True and False))` evaluate to?',
				[
					{ id: 'a', label: '`True`' },
					{ id: 'b', label: '`False`' },
					{ id: 'c', label: '`None`' },
					{ id: 'd', label: 'An error.' }
				]
			)
		]
	},
	loops: {
		console: [
			{
				kind: 'forPrintList',
				title: 'Repeating With a `for` Loop',
				intro: 'A loop lets you repeat a block of code without copying it.',
				list: ['1', '2', '3'],
				loopVar: 'number'
			},
			{
				kind: 'forPrintList',
				title: 'Looping Over Words',
				intro: 'Loops work with strings just as well as numbers.',
				list: ['"axe"', '"bow"', '"staff"'],
				loopVar: 'weapon'
			},
			{
				kind: 'accumulateSumPrint',
				title: 'Accumulating a Total',
				intro: 'Loops are often used to build up a result over time.',
				values: [2, 3, 4],
				loopVar: 'value'
			},
			{
				kind: 'whileCountdown',
				title: 'Counting Down With `while`',
				intro: 'A `while` loop repeats as long as its condition stays true.',
				start: 3
			}
		],
		unit: [
			{
				kind: 'sumList',
				title: 'Summing a List With a Loop',
				intro: 'Loops let a function process every item in a list.',
				functionName: 'sum_coins',
				param: 'coins',
				itemName: 'coin'
			},
			{
				kind: 'countAtLeast',
				title: 'Counting Matching Scores',
				intro: 'Loops and comparisons work well together.',
				functionName: 'count_big_scores',
				param: 'scores',
				itemName: 'score',
				threshold: 10
			},
			{
				kind: 'repeatWord',
				title: 'Repeating a Word',
				intro: 'Loops can build strings too, not just totals.',
				functionName: 'repeat_word',
				params: ['word', 'times']
			}
		],
		quiz: [
			q(
				'Quiz: Why Loops Matter',
				'Loops let you repeat work without duplicating code.',
				'Why use a loop instead of copying the same line again and again?',
				[
					{ id: 'a', label: 'To repeat work without duplicating code.' },
					{ id: 'b', label: 'To give a block of code a reusable name.' },
					{ id: 'c', label: 'To store many values in order.' },
					{ id: 'd', label: 'To compare two values.' }
				]
			),
			q(
				'Quiz: Loop Variables',
				'In a `for` loop, the loop variable holds the current item.',
				'On the first pass of `for weapon in ["axe", "bow"]`, what is `weapon`?',
				[
					{ id: 'a', label: '`"axe"`' },
					{ id: 'b', label: '`"bow"`' },
					{ id: 'c', label: '`weapon`' },
					{ id: 'd', label: '`0`' }
				]
			),
			q(
				'Quiz: Stopping a `while` Loop',
				'A `while` loop stops when its condition becomes false.',
				'When does a `while` loop stop?',
				[
					{ id: 'a', label: 'Its condition becomes false.' },
					{ id: 'b', label: 'Its condition becomes true.' },
					{ id: 'c', label: 'The loop body finishes once.' },
					{ id: 'd', label: 'Any variable inside it changes value.' }
				]
			)
		]
	},
	lists: {
		console: [
			{
				kind: 'listFirstItem',
				title: 'Creating a List and Reading an Item',
				intro: 'A list stores multiple values in order.',
				listName: 'items',
				list: ['"rope"', '"torch"', '"map"']
			},
			{
				kind: 'listAppendLen',
				title: 'Adding to a List',
				intro: 'Lists can change over time.',
				listName: 'bag',
				initial: ['"potion"'],
				append: '"elixir"'
			},
			{
				kind: 'forPrintNamedList',
				title: 'Looping Over a List',
				intro: 'Lists and loops fit together naturally.',
				listName: 'colors',
				list: ['"red"', '"green"', '"blue"'],
				loopVar: 'color'
			}
		],
		unit: [
			{
				kind: 'getLastItem',
				title: 'Getting the Last Item',
				intro: 'Lists support negative indexes.',
				functionName: 'get_last_item',
				param: 'items'
			},
			{
				kind: 'countEvenList',
				title: 'Counting Even Numbers in a List',
				intro: 'This combines list processing, loops, and a numeric condition.',
				functionName: 'count_even',
				param: 'nums',
				itemName: 'num'
			},
			{
				kind: 'findSmallest',
				title: 'Finding the Smallest Number',
				intro: 'Start with the first item and keep a best-so-far value.',
				functionName: 'smallest',
				param: 'items',
				itemName: 'item'
			},
			{
				kind: 'joinNames',
				title: 'Joining Names With Commas',
				intro: 'Lists often need to be turned back into one display string.',
				functionName: 'join_names',
				param: 'names'
			}
		],
		quiz: [
			q(
				'Quiz: What a List Stores',
				'A list stores multiple values in a specific order.',
				'What does `["rope", "torch", "map"]` represent?',
				[
					{ id: 'a', label: 'An ordered collection of values.' },
					{ id: 'b', label: 'A named block of reusable code.' },
					{ id: 'c', label: 'A collection of key/value pairs.' },
					{ id: 'd', label: 'A collection that only keeps unique values.' }
				]
			),
			q(
				'Quiz: Indexes Start at Zero',
				'Python uses zero-based indexing for lists.',
				'If `items = ["rope", "torch", "map"]`, which index gets `"rope"`?',
				[
					{ id: 'a', label: '0' },
					{ id: 'b', label: '1' },
					{ id: 'c', label: '-1' },
					{ id: 'd', label: 'first' }
				]
			),
			q(
				'Quiz: What `append()` Does',
				'`append()` adds one item to the end of a list.',
				'What does `bag.append("elixir")` do?',
				[
					{ id: 'a', label: 'Adds `"elixir"` to the end of `bag`.' },
					{ id: 'b', label: 'Adds `"elixir"` to the beginning of `bag`.' },
					{ id: 'c', label: 'Replaces the whole list with `"elixir"`.' },
					{ id: 'd', label: 'Returns the last item in `bag`.' }
				]
			)
		]
	},
	dictionaries: {
		console: [
			{
				kind: 'dictLookup',
				title: 'Reading a Value by Key',
				intro: 'A dictionary stores values by key instead of by position.',
				dictName: 'player',
				entries: { name: 'Ayla', level: 3 },
				key: 'name'
			},
			{
				kind: 'dictUpdatePrint',
				title: 'Updating a Dictionary',
				intro: 'Dictionaries are mutable, so you can replace a value for a key.',
				dictName: 'bag',
				entries: { gold: 10 },
				key: 'gold',
				value: 15
			},
			{
				kind: 'dictTwoLookups',
				title: 'Using Multiple Dictionary Values',
				intro: 'One dictionary can hold several related values about the same thing.',
				dictName: 'player',
				entries: { name: 'Ayla', level: 3 },
				keys: ['name', 'level']
			}
		],
		unit: [
			{
				kind: 'dictGetKey',
				title: 'Getting a Score From a Dictionary',
				intro: 'Dictionary helper functions make data access reusable.',
				functionName: 'get_score',
				param: 'player',
				key: 'score'
			},
			{
				kind: 'dictHasKey',
				title: 'Checking Whether a Key Exists',
				intro: 'The `in` operator checks whether a key exists in a dictionary.',
				functionName: 'has_item',
				params: ['inventory', 'item']
			},
			{
				kind: 'dictSumValues',
				title: 'Summing Dictionary Values',
				intro: 'Looping over `values()` is a clean way to total stored counts.',
				functionName: 'total_items',
				param: 'counts'
			},
			{
				kind: 'dictDescribe',
				title: 'Describing a Player',
				intro: 'Dictionaries make it easy to format related values into a sentence.',
				functionName: 'describe_player',
				param: 'player'
			}
		],
		quiz: [
			q(
				'Quiz: What a Dictionary Stores',
				'Dictionaries store values by key.',
				'What kind of data is a dictionary best for?',
				[
					{ id: 'a', label: 'Storing key/value pairs.' },
					{ id: 'b', label: 'Storing values by numeric position only.' },
					{ id: 'c', label: 'Keeping only unique values.' },
					{ id: 'd', label: 'Grouping steps into reusable code.' }
				]
			),
			q(
				'Quiz: Looking Up by Key',
				'Dictionary lookups use keys inside square brackets.',
				'If `player = {"name": "Ayla", "level": 3}`, what does `player["name"]` give you?',
				[
					{ id: 'a', label: '`"Ayla"`' },
					{ id: 'b', label: '`3`' },
					{ id: 'c', label: '`"name"`' },
					{ id: 'd', label: 'An error every time.' }
				]
			),
			q(
				'Quiz: The `in` Operator for Keys',
				'With dictionaries, `in` checks keys.',
				'What does `"potion" in inventory` check when `inventory` is a dictionary?',
				[
					{ id: 'a', label: 'Whether `"potion"` is a key.' },
					{ id: 'b', label: 'Whether any value equals `"potion"`.' },
					{ id: 'c', label: 'Whether `"potion"` should be added as a key.' },
					{ id: 'd', label: 'Whether `"potion"` is the first key in the dictionary.' }
				]
			)
		]
	},
	sets: {
		console: [
			{
				kind: 'setLenUnique',
				title: 'Sets Keep Unique Values',
				intro: 'Sets automatically remove duplicates.',
				setName: 'gems',
				values: ['"ruby"', '"emerald"', '"ruby"']
			},
			{
				kind: 'setAddMembership',
				title: 'Adding to a Set',
				intro: 'Sets are useful for fast membership checks.',
				setName: 'tools',
				values: ['"torch"'],
				add: '"rope"',
				check: '"rope"'
			},
			{
				kind: 'setIntersectionLen',
				title: 'Finding Shared Values',
				intro: 'Set operations let you compare unique collections directly.',
				left: ['"axe"', '"bow"'],
				right: ['"bow"', '"staff"']
			}
		],
		unit: [
			{
				kind: 'uniqueCount',
				title: 'Counting Unique Items',
				intro: 'Turning a list into a set throws away duplicates.',
				functionName: 'unique_count',
				param: 'items'
			},
			{
				kind: 'hasDuplicates',
				title: 'Detecting Duplicates',
				intro: 'If the set is smaller than the list, duplicates were removed.',
				functionName: 'has_duplicates',
				param: 'items'
			},
			{
				kind: 'setIntersection',
				title: 'Finding Shared Items',
				intro: 'Set intersection keeps only shared values.',
				functionName: 'shared_items',
				params: ['left', 'right']
			},
			{
				kind: 'setDifference',
				title: 'Finding Newly Earned Badges',
				intro: 'Set difference keeps values from one set that are not in another.',
				functionName: 'new_badges',
				params: ['earned', 'owned']
			}
		],
		quiz: [
			q(
				'Quiz: What Makes a Set Special',
				'Sets are mainly about uniqueness.',
				'How many items are in `{"ruby", "emerald", "ruby"}`?',
				[
					{ id: 'a', label: '2' },
					{ id: 'b', label: '3' },
					{ id: 'c', label: '1' },
					{ id: 'd', label: 'An error.' }
				]
			),
			q(
				'Quiz: Membership Checks',
				'Checking whether a value is present is a common use of sets.',
				'What does `"rope" in tools` check if `tools` is a set?',
				[
					{ id: 'a', label: 'Whether `"rope"` is in the set.' },
					{ id: 'b', label: 'Whether `"rope"` would come first if the set were sorted.' },
					{ id: 'c', label: 'Whether the set has exactly one item.' },
					{ id: 'd', label: 'Whether `"rope"` is a key with a value.' }
				]
			),
			q(
				'Quiz: Intersection Meaning',
				'Set intersection keeps only shared values.',
				'What is `{"axe", "bow"} & {"bow", "staff"}`?',
				[
					{ id: 'a', label: '`{"bow"}`' },
					{ id: 'b', label: '`{"axe", "bow", "staff"}`' },
					{ id: 'c', label: '`{"axe"}`' },
					{ id: 'd', label: '`{"staff"}`' }
				]
			)
		]
	},
	errors: {
		console: [
			{
				kind: 'convertIntAndPrint',
				title: 'Turning Text Into a Number',
				intro: 'Real programs often receive input as text.',
				text: '"12"',
				add: 1
			},
			{
				kind: 'dictGetDefault',
				title: 'Avoiding a Missing-Key Error',
				intro: '`.get()` gives you a safer dictionary lookup when a default makes sense.',
				dictName: 'player',
				entries: { name: 'Ayla' },
				key: 'level',
				fallback: 0
			},
			{
				kind: 'tryExceptInt',
				title: 'Using `try` and `except`',
				intro: 'Some operations fail on bad input. `try` and `except` let you recover.',
				text: '"oops"',
				fallback: 'invalid number'
			},
			{
				kind: 'guardDivide',
				title: 'Checking Before Dividing',
				intro: 'Preventing an error is often better than catching it.',
				total: 10,
				count: 0,
				fallback: 'cannot divide'
			}
		],
		unit: [
			{
				kind: 'safeDivide',
				title: 'Dividing Safely',
				intro: 'Edge cases matter. A function is not finished until it handles awkward inputs too.',
				functionName: 'safe_divide',
				params: ['total', 'count']
			},
			{
				kind: 'parseIntDefault',
				title: 'Parsing a Level Safely',
				intro: 'Try a conversion and fall back gracefully if it fails.',
				functionName: 'parse_level',
				param: 'text'
			},
			{
				kind: 'firstItemOrNone',
				title: 'Reading the First Item Safely',
				intro: 'A careful function handles the empty case before reading index 0.',
				functionName: 'first_item',
				param: 'items'
			}
		],
		quiz: [
			q(
				'Quiz: What an Error Is',
				'An error is a problem that stops code from behaving normally.',
				'What happens if Python runs `int("oops")`?',
				[
					{ id: 'a', label: 'It raises an error.' },
					{ id: 'b', label: 'It returns `0`.' },
					{ id: 'c', label: 'It returns `None`.' },
					{ id: 'd', label: 'It strips the quotes and returns `oops`.' }
				]
			),
			q(
				'Quiz: Why Handle Errors',
				'Programs are more reliable when they account for bad input and edge cases.',
				'Why handle errors instead of ignoring them?',
				[
					{ id: 'a', label: 'To make the program safer and more predictable.' },
					{ id: 'b', label: 'To guarantee the program can never fail.' },
					{ id: 'c', label: 'To avoid thinking about bad input.' },
					{ id: 'd', label: 'To make every invalid value become valid automatically.' }
				]
			),
			q(
				'Quiz: What `except` Does',
				'`except` defines what your program should do if a matching error happens.',
				'When does an `except` block run?',
				[
					{ id: 'a', label: 'When a matching error happens in the `try` block.' },
					{ id: 'b', label: 'Every time after the `try` block finishes.' },
					{ id: 'c', label: 'Before the `try` block runs.' },
					{ id: 'd', label: 'Only when the function returns `None`.' }
				]
			)
		]
	},
	practice: {
		console: [
			{
				kind: 'practiceSumList',
				title: 'Practice: Summing Prices',
				intro: 'Practice lessons combine several earlier ideas in one small task.',
				listName: 'prices',
				values: [4, 6, 3],
				loopVar: 'price'
			},
			{
				kind: 'practiceDictTotal',
				title: 'Practice: Inventory Summary',
				intro: 'Combining dictionaries and arithmetic starts to feel like real data modeling.',
				dictName: 'bag',
				entries: { rope: 1, torch: 2 }
			},
			{
				kind: 'practiceUniqueCount',
				title: 'Practice: Counting Unique Tags',
				intro: 'Practice is often about choosing the right tool for the job.',
				listName: 'tags',
				values: ['"fire"', '"ice"', '"fire"', '"wind"']
			}
		],
		unit: [
			{
				kind: 'averageOrZero',
				title: 'Practice: Averaging Scores',
				intro: 'This combines loops, lists, arithmetic, and an empty-input edge case.',
				functionName: 'average',
				param: 'scores',
				itemName: 'score'
			},
			{
				kind: 'filterAtLeast',
				title: 'Practice: Filtering Unlocked Levels',
				intro: 'Filtering means keeping matching values and ignoring the rest.',
				functionName: 'filter_unlocked',
				params: ['levels', 'minimum'],
				itemName: 'level'
			},
			{
				kind: 'dictSumValues',
				title: 'Practice: Inventory Total',
				intro: 'This is the same total-building idea in dictionary form.',
				functionName: 'inventory_total',
				param: 'items'
			},
			{
				kind: 'topScore',
				title: 'Practice: Top Score',
				intro: 'This is a best-so-far loop plus an empty-input case.',
				functionName: 'top_score',
				param: 'scores',
				itemName: 'score'
			},
			{
				kind: 'canCraft',
				title: 'Practice: Can Craft',
				intro: 'This combines dictionaries, defaults, loops, and comparisons.',
				functionName: 'can_craft',
				params: ['bag', 'recipe']
			}
		],
		quiz: [
			q(
				'Quiz: Choosing the Right Tool',
				'Good programming often means choosing the data structure that fits the job.',
				'Which Python data type would you pick for unique values only?',
				[
					{ id: 'a', label: 'A set.' },
					{ id: 'b', label: 'A list.' },
					{ id: 'c', label: 'A dictionary.' },
					{ id: 'd', label: 'A string.' }
				]
			),
			q(
				'Quiz: Breaking Problems Into Steps',
				'Larger beginner problems are usually several small ideas combined.',
				'What is a good approach to a larger beginner problem?',
				[
					{ id: 'a', label: 'Break it into smaller steps you already know how to solve.' },
					{ id: 'b', label: 'Write it all in one big expression so you finish faster.' },
					{ id: 'c', label: 'Solve every edge case before understanding the main task.' },
					{ id: 'd', label: 'Start over from scratch each time one small part is confusing.' }
				]
			)
		]
	},
	quiz: {
		quiz: [
			q(
				'Review Quiz: Printing Output',
				'Printing output is the first feedback loop in a beginner program.',
				'Which function prints a value to the console?',
				[
					{ id: 'a', label: '`print()`' },
					{ id: 'b', label: '`input()`' },
					{ id: 'c', label: '`len()`' },
					{ id: 'd', label: '`str()`' }
				]
			),
			q(
				'Review Quiz: Variables',
				'Variables let code store and reuse values.',
				'What is the job of a variable?',
				[
					{ id: 'a', label: 'To store a value for later use.' },
					{ id: 'b', label: 'To repeat code over a collection.' },
					{ id: 'c', label: 'To keep only unique values.' },
					{ id: 'd', label: 'To handle runtime errors.' }
				]
			),
			q(
				'Review Quiz: Functions',
				'Functions package reusable behavior behind a name.',
				'Which keyword starts a function definition in Python?',
				[
					{ id: 'a', label: '`def`' },
					{ id: 'b', label: '`return`' },
					{ id: 'c', label: '`if`' },
					{ id: 'd', label: '`for`' }
				]
			),
			q(
				'Review Quiz: Scope',
				'Scope determines where a variable can be used.',
				'A variable created inside a function is usually called what?',
				[
					{ id: 'a', label: 'A local variable.' },
					{ id: 'b', label: 'A global variable.' },
					{ id: 'c', label: 'A parameter.' },
					{ id: 'd', label: 'A constant.' }
				]
			),
			q(
				'Review Quiz: Comparisons',
				'Comparisons answer yes-or-no questions with booleans.',
				'What does `==` check?',
				[
					{ id: 'a', label: 'It checks whether two values are equal.' },
					{ id: 'b', label: 'It stores a value in a variable.' },
					{ id: 'c', label: 'It adds one value to another.' },
					{ id: 'd', label: 'It checks whether a value is greater than another.' }
				]
			),
			q(
				'Review Quiz: Loops',
				'Loops repeat code without duplication.',
				'Which keyword is commonly used to loop over a list?',
				[
					{ id: 'a', label: '`for`' },
					{ id: 'b', label: '`while`' },
					{ id: 'c', label: '`def`' },
					{ id: 'd', label: '`if`' }
				]
			),
			q(
				'Review Quiz: Lists',
				'Lists are ordered collections.',
				'What index gets the first item in a list?',
				[
					{ id: 'a', label: '0' },
					{ id: 'b', label: '1' },
					{ id: 'c', label: '-1' },
					{ id: 'd', label: 'first' }
				]
			),
			q(
				'Review Quiz: Dictionaries',
				'Dictionaries store data by key.',
				'Which Python collection stores key/value pairs?',
				[
					{ id: 'a', label: 'A dictionary.' },
					{ id: 'b', label: 'A list.' },
					{ id: 'c', label: 'A set.' },
					{ id: 'd', label: 'A tuple.' }
				]
			),
			q(
				'Review Quiz: Sets',
				'Sets are about uniqueness and membership checks.',
				'Which data type is built for unique values?',
				[
					{ id: 'a', label: 'A set.' },
					{ id: 'b', label: 'A list.' },
					{ id: 'c', label: 'A dictionary.' },
					{ id: 'd', label: 'A tuple.' }
				]
			),
			q(
				'Review Quiz: Errors',
				'Good code handles bad input and awkward edge cases.',
				'Why might you use `try` and `except`?',
				[
					{ id: 'a', label: 'To recover from expected kinds of runtime errors.' },
					{ id: 'b', label: 'To define a new list.' },
					{ id: 'c', label: 'To compare two values.' },
					{ id: 'd', label: 'To make every value a string.' }
				]
			)
		]
	}
};

const pad = (value) => String(value).padStart(2, '0');
const slugify = (value) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
const strip = (value) => value.replace(/\n$/, '');
const writeText = async (filePath, contents) => {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, contents, 'utf8');
};

const py = (value) => {
	if (value instanceof Set) return value.size ? `{${[...value].map(py).join(', ')}}` : 'set()';
	if (typeof value === 'boolean') return value ? 'True' : 'False';
	if (value === null) return 'None';
	if (Array.isArray(value)) return `[${value.map(py).join(', ')}]`;
	if (typeof value === 'string') return JSON.stringify(value);
	if (typeof value === 'object')
		return `{${Object.entries(value)
			.map(([k, v]) => `${JSON.stringify(k)}: ${py(v)}`)
			.join(', ')}}`;
	return String(value);
};

const modeSequence = (counts) => {
	const remaining = { ...counts };
	const out = [];
	while (out.length < 10) {
		for (const mode of ['console', 'quiz', 'unit']) {
			if ((remaining[mode] ?? 0) > 0) {
				out.push(mode);
				remaining[mode] -= 1;
				if (out.length === 10) break;
			}
		}
	}
	return out;
};

const md = (title, intro, example, assignment) => `# ${title}

${intro}

\`\`\`python
${strip(example)}
\`\`\`

Let's break it down:

- Read the example carefully and notice the pattern.
- Update the starter code so it follows the same idea.
- Match the prompt exactly, because the tests compare exact results.

## Assignment

${assignment}
`;

const quizMd = (title, concept) => `# ${title}

${concept}
`;

const buildConsole = (def) => {
	switch (def.kind) {
		case 'printText': {
			const text = def.raw ? def.text : JSON.stringify(def.text);
			const code = `print(${text})\n`;
			const out = def.raw ? `${def.text}\n` : `${def.text}\n`;
			return {
				prompt: def.raw
					? `Print ${def.text}.`
					: `Print the exact phrase ${JSON.stringify(def.text)}.`,
				starter: '# Follow the prompt exactly.\nprint("change me")\n',
				solution: code,
				example: code,
				stdout: out,
				assignment: `Change the code so it prints exactly ${def.raw ? `\`${def.text}\`` : `\`${def.text}\``}.`
			};
		}
		case 'printLines': {
			const code = `${def.lines.map((line) => `print(${JSON.stringify(line)})`).join('\n')}\n`;
			return {
				prompt: `Print ${def.lines.map((line) => JSON.stringify(line)).join(', ')} on separate lines.`,
				starter: '# Print each required line in order.\nprint("todo")\n',
				solution: code,
				example: code,
				stdout: `${def.lines.join('\n')}\n`,
				assignment: `Print each required line on its own line in the correct order.`
			};
		}
		case 'printExpression': {
			const code = `print(${def.expression})\n`;
			return {
				prompt: `Print the result of ${def.expression}.`,
				starter: '# Print the result of the expression.\nprint(0)\n',
				solution: code,
				example: code,
				stdout: `${Function(`return (${def.expression})`)()}\n`,
				assignment: `Evaluate the expression and print the result.`
			};
		}
		case 'printMixed': {
			const code = `${def.values.map((value) => `print(${value})`).join('\n')}\n`;
			return {
				prompt: 'Print the requested string and number on separate lines.',
				starter: '# Print the string and the number on separate lines.\nprint("todo")\n',
				solution: code,
				example: code,
				stdout: `${def.values.map((value) => Function(`return ${value}`)()).join('\n')}\n`,
				assignment: 'Use quotes for text and no quotes for numbers.'
			};
		}
		case 'varStorePrint': {
			const code = `${def.varName} = ${def.value}\nprint(${def.varName})\n`;
			return {
				prompt: `Store ${def.value} in \`${def.varName}\` and print it.`,
				starter: `# Store the value in ${def.varName} and print it.\n${def.varName} = ""\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.value}`)()}\n`,
				assignment: `Create the variable, store the value, and print the variable.`
			};
		}
		case 'varUpdate': {
			const code = `${def.varName} = ${def.start}\n${def.update}\nprint(${def.varName})\n`;
			return {
				prompt: `Start with ${def.start} in \`${def.varName}\`, update it, and print the final value.`,
				starter: `# Update the variable before printing it.\n${def.varName} = 0\nprint(${def.varName})\n`,
				solution: code,
				example: code,
				stdout: `${Function(`let ${def.varName}=${def.start}; ${def.update}; return ${def.varName}`)()}\n`,
				assignment: 'Store the starting value, perform the update, and print the final result.'
			};
		}
		case 'varCalc': {
			const code = `${def.lines.join('\n')}\nprint(${def.output})\n`;
			const stdout = Function(
				`const lines=[]; const print=(value)=>lines.push(String(value)); ${def.lines.join(';')}; if (lines.length) return lines.join("\\n") + "\\n"; return String(${def.output}) + "\\n";`
			)();
			return {
				prompt: `Use variables to calculate and print \`${def.output}\`.`,
				starter: '# Build the value with variables and print it.\nprint(0)\n',
				solution: code,
				example: code,
				stdout,
				assignment: `Create the variables, perform the calculation, and print \`${def.output}\`.`
			};
		}
		case 'varReuse': {
			const code = `${def.varName} = ${def.value}\n${Array.from({ length: def.times }, () => `print(${def.varName})`).join('\n')}\n`;
			return {
				prompt: `Store ${def.value} in \`${def.varName}\` and print it ${def.times} times.`,
				starter: `# Reuse the variable instead of repeating the literal.\n${def.varName} = ""\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${Array.from({ length: def.times }, () => Function(`return ${def.value}`)()).join('\n')}\n`,
				assignment: 'Store the value once, then print the same variable each time you need it.'
			};
		}
		case 'lenPrint': {
			const code = `print(len(${JSON.stringify(def.text)}))\n`;
			return {
				prompt: `Use \`len\` to print how many letters are in ${JSON.stringify(def.text)}.`,
				starter: '# Call len() and print the result.\nprint(0)\n',
				solution: code,
				example: code,
				stdout: `${def.text.length}\n`,
				assignment: 'Call `len()` with the given string and print the result.'
			};
		}
		case 'definePrintFn': {
			const code = `def ${def.functionName}():\n    print(${JSON.stringify(def.message)})\n\n${def.functionName}()\n`;
			return {
				prompt: `Define \`${def.functionName}\` so it prints ${JSON.stringify(def.message)}, then call it once.`,
				starter: `# Define ${def.functionName}() and call it.\ndef ${def.functionName}():\n    print("todo")\n\n`,
				solution: code,
				example: code,
				stdout: `${def.message}\n`,
				assignment: 'Write the function body, then call the function below the definition.'
			};
		}
		case 'defineParamFnPrint': {
			const body = def.body.join('\n    ');
			const code = `def ${def.functionName}(${def.paramName}):\n    ${body}\n\n${def.functionName}(${def.call})\n`;
			const out = Function(
				`${def.paramName}=${def.call}; const lines=[]; const print=(value)=>lines.push(String(value)); ${def.body.join(';')}; return lines.join("\\n") + "\\n";`
			)();
			return {
				prompt: `Write \`${def.functionName}(${def.paramName})\` and call it with ${def.call}.`,
				starter: `# Use the parameter inside the function.\ndef ${def.functionName}(${def.paramName}):\n    print("todo")\n\n${def.functionName}("")\n`,
				solution: code,
				example: code,
				stdout: out,
				assignment:
					'Use the parameter inside the function body, then call the function with the required value.'
			};
		}
		case 'defineReturnFnPrint': {
			const params = def.params.join(', ');
			const call = def.callArgs.join(', ');
			const code = `def ${def.functionName}(${params}):\n    return ${def.returnExpr}\n\nprint(${def.functionName}(${call}))\n`;
			return {
				prompt: `Define \`${def.functionName}\` so it returns a value, then print the result of calling it.`,
				starter: `# Make the function return the correct value, then print the call result.\ndef ${def.functionName}(${params}):\n    return 0\n\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${Function(...def.params, `return ${def.returnExpr}`)(...def.callArgs.map((arg) => Function(`return ${arg}`)()))}\n`,
				assignment: 'Return the computed value from the function and print the function call.'
			};
		}
		case 'areaOfCircle': {
			const code = `def area_of_circle(r):\n    pi = 3.14\n    result = pi * r * r\n    return result\n\nspear_length = 2\nspear_area = area_of_circle(spear_length)\nprint(spear_area)\n`;
			return {
				prompt:
					'Call `area_of_circle` with `spear_length`, store the result in `spear_area`, and print it.',
				starter:
					'def area_of_circle(r):\n    pi = 3.14\n    result = pi * r * r\n    return result\n\nspear_length = 2\nspear_area = 0\nprint(spear_area)\n',
				solution: code,
				example: code,
				stdout: '12.56\n',
				assignment:
					'The helper function already exists. Fix the bug by storing the returned value in `spear_area` before printing.'
			};
		}
		case 'scopeLocalPrint': {
			const code = `def ${def.functionName}():\n    ${def.localName} = ${def.value}\n    print(${def.localName})\n\n${def.functionName}()\n`;
			return {
				prompt: `Inside \`${def.functionName}\`, create a local variable and print it, then call the function.`,
				starter: `# Create a local variable inside the function.\ndef ${def.functionName}():\n    print("todo")\n\n${def.functionName}()\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.value}`)()}\n`,
				assignment: 'Create the local variable inside the function body and print it there.'
			};
		}
		case 'scopeParamPrint': {
			const code = `def ${def.functionName}(${def.paramName}):\n    print(${def.paramName})\n\n${def.functionName}(${def.call})\n`;
			return {
				prompt: `Use the parameter inside \`${def.functionName}\` and call the function with ${def.call}.`,
				starter: `# Print the local parameter inside the function.\ndef ${def.functionName}(${def.paramName}):\n    print("todo")\n\n${def.functionName}("")\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.call}`)()}\n`,
				assignment: 'Remember that the parameter is local to the function body.'
			};
		}
		case 'scopeReturnPrint': {
			const code = `def ${def.functionName}():\n    ${def.localName} = ${def.value}\n    return ${def.localName}\n\nprint(${def.functionName}())\n`;
			return {
				prompt: `Return a value from \`${def.functionName}\` and print the call result.`,
				starter: `# Return the value from the function and print the result.\ndef ${def.functionName}():\n    return ""\n\nprint("")\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.value}`)()}\n`,
				assignment:
					'Return the local value from the function, then print the function call outside it.'
			};
		}
		case 'scopeTwoFns': {
			const code = `def left():\n    count = 1\n    print(count)\n\n\ndef right():\n    count = 2\n    print(count)\n\nleft()\nright()\n`;
			return {
				prompt: 'Write `left()` to print 1 and `right()` to print 2, then call both.',
				starter:
					'# Each function should use its own local variable.\ndef left():\n    print(0)\n\n\ndef right():\n    print(0)\n\nleft()\nright()\n',
				solution: code,
				example: code,
				stdout: '1\n2\n',
				assignment:
					'Each function can have its own local variable, even if both variables use the same name.'
			};
		}
		case 'scopeOuterRead': {
			const code = `${def.outerName} = ${def.value}\n\ndef ${def.functionName}():\n    print(${def.outerName})\n\n${def.functionName}()\n`;
			return {
				prompt: `Create an outer variable and print it inside \`${def.functionName}\`.`,
				starter: `# Let the function read the outer variable.\n${def.outerName} = ""\n\ndef ${def.functionName}():\n    print("todo")\n\n${def.functionName}()\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.value}`)()}\n`,
				assignment:
					'Define the outer variable before the function, then read it inside the function.'
			};
		}
		case 'printComparison': {
			const code = `print(${def.comparison})\n`;
			return {
				prompt: `Print the result of \`${def.comparison}\`.`,
				starter: '# Print the comparison result.\nprint(False)\n',
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.comparison}`)()}\n`,
				assignment: 'Remember that a comparison expression evaluates to `True` or `False`.'
			};
		}
		case 'ifBoolPrint': {
			const code = `${def.setup.join('\n')}\nif ${def.condition}:\n    print(${JSON.stringify(def.passText)})\n`;
			return {
				prompt: `Use an \`if\` statement so the program prints ${JSON.stringify(def.passText)} when the condition passes.`,
				starter: `# Write the if statement using the given condition.\n${def.setup.join('\n')}\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${def.passText}\n`,
				assignment: 'Create the condition and put the print inside the indented `if` block.'
			};
		}
		case 'ifElse': {
			const code = `${def.setup.join('\n')}\nif ${def.condition}:\n    print(${JSON.stringify(def.passText)})\nelse:\n    print(${JSON.stringify(def.failText)})\n`;
			const scope = {};
			for (const line of def.setup) {
				const [name, value] = line.split('=').map((part) => part.trim());
				scope[name] = Function(`return ${value}`)();
			}
			const out = Function(
				...Object.keys(scope),
				`return ${def.condition}`
			)(...Object.values(scope))
				? def.passText
				: def.failText;
			return {
				prompt: 'Use `if` and `else` so the program prints the correct message.',
				starter: `# Use if/else to choose the correct output.\n${def.setup.join('\n')}\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${out}\n`,
				assignment: 'Write both branches so the code handles both the true case and the false case.'
			};
		}
		case 'forPrintList': {
			const items = `[${def.list.join(', ')}]`;
			const code = `for ${def.loopVar} in ${items}:\n    print(${def.loopVar})\n`;
			return {
				prompt: 'Use a loop to print each item on its own line.',
				starter: `# Use a loop to print each item.\nfor ${def.loopVar} in []:\n    print(${def.loopVar})\n`,
				solution: code,
				example: code,
				stdout: `${def.list.map((item) => Function(`return ${item}`)()).join('\n')}\n`,
				assignment: 'Write the list and loop over it in order.'
			};
		}
		case 'forPrintNamedList': {
			const code = `${def.listName} = [${def.list.join(', ')}]\nfor ${def.loopVar} in ${def.listName}:\n    print(${def.loopVar})\n`;
			return {
				prompt: `Store the items in \`${def.listName}\` and use a loop to print them.`,
				starter: `# Store the values in a list and loop over it.\n${def.listName} = []\nfor ${def.loopVar} in ${def.listName}:\n    print(${def.loopVar})\n`,
				solution: code,
				example: code,
				stdout: `${def.list.map((item) => Function(`return ${item}`)()).join('\n')}\n`,
				assignment: 'Make the list first, then loop over the variable that holds it.'
			};
		}
		case 'accumulateSumPrint': {
			const code = `total = 0\nfor ${def.loopVar} in [${def.values.join(', ')}]:\n    total = total + ${def.loopVar}\nprint(total)\n`;
			return {
				prompt: 'Use a loop to add the values into `total`, then print `total`.',
				starter: `# Use accumulation to build the total.\ntotal = 0\nfor ${def.loopVar} in [${def.values.join(', ')}]:\n    pass\nprint(total)\n`,
				solution: code,
				example: code,
				stdout: `${def.values.reduce((sum, value) => sum + value, 0)}\n`,
				assignment: 'Start `total` at 0 and add one value per loop iteration.'
			};
		}
		case 'whileCountdown': {
			const code = `count = ${def.start}\nwhile count > 0:\n    print(count)\n    count = count - 1\n`;
			return {
				prompt: `Use a \`while\` loop to count down from ${def.start} to 1.`,
				starter: `# Use a while loop to count down.\ncount = ${def.start}\nwhile False:\n    print(count)\n`,
				solution: code,
				example: code,
				stdout: `${Array.from({ length: def.start }, (_, index) => def.start - index).join('\n')}\n`,
				assignment:
					'Update the loop variable inside the loop so the condition eventually becomes false.'
			};
		}
		case 'listFirstItem': {
			const code = `${def.listName} = [${def.list.join(', ')}]\nprint(${def.listName}[0])\n`;
			return {
				prompt: `Store the list in \`${def.listName}\` and print the first item.`,
				starter: `# Store the list and print the first item.\n${def.listName} = []\nprint("")\n`,
				solution: code,
				example: code,
				stdout: `${Function(`return ${def.list[0]}`)()}\n`,
				assignment: 'Remember that the first list index is `0`.'
			};
		}
		case 'listAppendLen': {
			const code = `${def.listName} = [${def.initial.join(', ')}]\n${def.listName}.append(${def.append})\nprint(len(${def.listName}))\n`;
			return {
				prompt: `Append a new item to \`${def.listName}\` and print the new length.`,
				starter: `# Append an item and print the updated length.\n${def.listName} = [${def.initial.join(', ')}]\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${def.initial.length + 1}\n`,
				assignment: 'Use `append()` to add the new item before printing `len(...)`.'
			};
		}
		case 'dictLookup': {
			const code = `${def.dictName} = ${py(def.entries)}\nprint(${def.dictName}[${JSON.stringify(def.key)}])\n`;
			return {
				prompt: `Create the dictionary and print the value for the key ${JSON.stringify(def.key)}.`,
				starter: `# Create the dictionary and print the requested value.\n${def.dictName} = {}\nprint("")\n`,
				solution: code,
				example: code,
				stdout: `${def.entries[def.key]}\n`,
				assignment: 'Use square brackets with the key to look up the stored value.'
			};
		}
		case 'dictUpdatePrint': {
			const code = `${def.dictName} = ${py(def.entries)}\n${def.dictName}[${JSON.stringify(def.key)}] = ${def.value}\nprint(${def.dictName}[${JSON.stringify(def.key)}])\n`;
			return {
				prompt: `Update the dictionary value for ${JSON.stringify(def.key)} and print it.`,
				starter: `# Replace the old value and print the new one.\n${def.dictName} = ${py(def.entries)}\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${def.value}\n`,
				assignment: 'Assign the new value to the existing key before printing it.'
			};
		}
		case 'dictTwoLookups': {
			const code = `${def.dictName} = ${py(def.entries)}\n${def.keys.map((key) => `print(${def.dictName}[${JSON.stringify(key)}])`).join('\n')}\n`;
			return {
				prompt: 'Print both requested dictionary values on separate lines.',
				starter: `# Print the requested values on separate lines.\n${def.dictName} = ${py(def.entries)}\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${def.keys.map((key) => def.entries[key]).join('\n')}\n`,
				assignment: 'Use a separate lookup for each key you need.'
			};
		}
		case 'setLenUnique': {
			const code = `${def.setName} = {${def.values.join(', ')}}\nprint(len(${def.setName}))\n`;
			return {
				prompt: 'Create the set and print how many unique values it contains.',
				starter: `# Create the set and print its length.\n${def.setName} = set()\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${new Set(def.values.map((value) => Function(`return ${value}`)())).size}\n`,
				assignment: 'Notice that duplicate values only count once in a set.'
			};
		}
		case 'setAddMembership': {
			const code = `${def.setName} = {${def.values.join(', ')}}\n${def.setName}.add(${def.add})\nprint(${def.check} in ${def.setName})\n`;
			return {
				prompt: 'Add the value to the set and print the membership test result.',
				starter: `# Add a value to the set and check membership.\n${def.setName} = {${def.values.join(', ')}}\nprint(False)\n`,
				solution: code,
				example: code,
				stdout: 'True\n',
				assignment: 'Use `.add()` to insert the value and `in` to check whether it is present.'
			};
		}
		case 'setIntersectionLen': {
			const code = `left = {${def.left.join(', ')}}\nright = {${def.right.join(', ')}}\nshared = left & right\nprint(len(shared))\n`;
			const left = new Set(def.left.map((value) => Function(`return ${value}`)()));
			const right = new Set(def.right.map((value) => Function(`return ${value}`)()));
			const shared = [...left].filter((value) => right.has(value));
			return {
				prompt: 'Create the two sets, compute their intersection, and print its length.',
				starter:
					'# Build two sets, find their intersection, and print the length.\nleft = set()\nright = set()\nprint(0)\n',
				solution: code,
				example: code,
				stdout: `${shared.length}\n`,
				assignment: 'Use `&` to compute the intersection, then measure it with `len(...)`.'
			};
		}
		case 'convertIntAndPrint': {
			const code = `age_text = ${def.text}\nprint(int(age_text) + ${def.add})\n`;
			return {
				prompt: 'Convert the text to an integer, add to it, and print the result.',
				starter: `# Convert the text to a number before doing math.\nage_text = ${def.text}\nprint(age_text)\n`,
				solution: code,
				example: code,
				stdout: `${parseInt(Function(`return ${def.text}`)(), 10) + def.add}\n`,
				assignment: 'Use `int(...)` before trying to do math with the text value.'
			};
		}
		case 'dictGetDefault': {
			const code = `${def.dictName} = ${py(def.entries)}\nprint(${def.dictName}.get(${JSON.stringify(def.key)}, ${def.fallback}))\n`;
			return {
				prompt: 'Use `.get()` with a default value and print the result.',
				starter: `# Use get() with a default value.\n${def.dictName} = ${py(def.entries)}\nprint("todo")\n`,
				solution: code,
				example: code,
				stdout: `${def.fallback}\n`,
				assignment: 'Use `.get(key, default)` when you want a safe fallback instead of an error.'
			};
		}
		case 'tryExceptInt': {
			const code = `text = ${def.text}\ntry:\n    print(int(text))\nexcept ValueError:\n    print(${JSON.stringify(def.fallback)})\n`;
			return {
				prompt: 'Try the conversion. If it fails, print the fallback message.',
				starter: `# Catch the conversion error and print the fallback message.\ntext = ${def.text}\nprint(int(text))\n`,
				solution: code,
				example: code,
				stdout: `${def.fallback}\n`,
				assignment:
					'Put the risky conversion in `try` and the fallback print in `except ValueError`.'
			};
		}
		case 'guardDivide': {
			const code = `total = ${def.total}\ncount = ${def.count}\nif count == 0:\n    print(${JSON.stringify(def.fallback)})\nelse:\n    print(total / count)\n`;
			return {
				prompt: 'Check for division by zero before dividing.',
				starter: `# Avoid dividing by zero.\ntotal = ${def.total}\ncount = ${def.count}\nprint(total / count)\n`,
				solution: code,
				example: code,
				stdout: `${def.fallback}\n`,
				assignment:
					'Use an `if` statement to handle the dangerous case before the division happens.'
			};
		}
		case 'practiceSumList': {
			const code = `${def.listName} = [${def.values.join(', ')}]\ntotal = 0\nfor ${def.loopVar} in ${def.listName}:\n    total = total + ${def.loopVar}\nprint(total)\n`;
			return {
				prompt: 'Store the list, sum it with a loop, and print the total.',
				starter: `# Sum the list values with a loop.\n${def.listName} = []\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${def.values.reduce((sum, value) => sum + value, 0)}\n`,
				assignment: 'Combine a list, a loop, and an accumulator variable in one short program.'
			};
		}
		case 'practiceDictTotal': {
			const keys = Object.keys(def.entries);
			const code = `${def.dictName} = ${py(def.entries)}\nprint(${keys.map((key) => `${def.dictName}[${JSON.stringify(key)}]`).join(' + ')})\n`;
			return {
				prompt: 'Store the dictionary and print the total of its values.',
				starter: `# Add the dictionary values and print the total.\n${def.dictName} = {}\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${Object.values(def.entries).reduce((sum, value) => sum + value, 0)}\n`,
				assignment: 'Look up each stored value, add them, and print the result.'
			};
		}
		case 'practiceUniqueCount': {
			const code = `${def.listName} = [${def.values.join(', ')}]\nprint(len(set(${def.listName})))\n`;
			return {
				prompt: 'Store the list, convert it to a set, and print the number of unique values.',
				starter: `# Use a set to count the unique values.\n${def.listName} = []\nprint(0)\n`,
				solution: code,
				example: code,
				stdout: `${new Set(def.values.map((value) => Function(`return ${value}`)())).size}\n`,
				assignment: 'Choose a set because the goal is uniqueness, not order.'
			};
		}
		default:
			throw new Error(`Unknown console lesson kind: ${def.kind}`);
	}
};

const unitTest = (functionName, publicCases) => `import unittest

from main import ${functionName}


class ${functionName
	.split('_')
	.map((part) => part[0].toUpperCase() + part.slice(1))
	.join('')}Test(unittest.TestCase):
    def test_public_cases(self):
${publicCases.map((item) => `        self.assertEqual(${functionName}(${item.args.map(py).join(', ')}), ${py(item.expected)})`).join('\n')}


if __name__ == "__main__":
    unittest.main()
`;

const buildUnit = (def) => {
	switch (def.kind) {
		case 'addConstant':
			return unitFrom(
				def,
				`return ${def.param} + ${def.amount}`,
				[
					{ name: 'public-small', args: [1], expected: 1 + def.amount },
					{ name: 'public-zero', args: [0], expected: def.amount }
				],
				[{ name: 'hidden-large', args: [10], expected: 10 + def.amount }],
				`Return the input plus ${def.amount}.`
			);
		case 'isEven':
			return unitFrom(
				def,
				`return ${def.param} % 2 == 0`,
				[
					{ name: 'public-even', args: [4], expected: true },
					{ name: 'public-odd', args: [5], expected: false }
				],
				[{ name: 'hidden-zero', args: [0], expected: true }],
				'Return `True` when the input is even.'
			);
		case 'prefixString':
			return unitFrom(
				def,
				`return ${JSON.stringify(def.prefix)} + ${def.param}`,
				[
					{ name: 'public-one', args: ['potion'], expected: `${def.prefix}potion` },
					{ name: 'public-two', args: ['key'], expected: `${def.prefix}key` }
				],
				[{ name: 'hidden-empty', args: [''], expected: def.prefix }],
				'Return the labeled string.'
			);
		case 'convertBitsToBytes':
			return unitFrom(
				def,
				`return ${def.param} // 8`,
				[
					{ name: 'public-eight', args: [8], expected: 1 },
					{ name: 'public-thirty-two', args: [32], expected: 4 }
				],
				[{ name: 'hidden-sixty-four', args: [64], expected: 8 }],
				'Use the fact that 8 bits make 1 byte.'
			);
		case 'multiplyBy1024':
			return unitFrom(
				def,
				`return ${def.param} * 1024`,
				[
					{ name: 'public-one', args: [1], expected: 1024 },
					{ name: 'public-three', args: [3], expected: 3072 }
				],
				[{ name: 'hidden-zero', args: [0], expected: 0 }],
				'Multiply by 1024 and return the result.'
			);
		case 'compareAtLeast':
			return unitFrom(
				def,
				`return ${def.compare}`,
				[
					{ name: 'public-low', args: [17], expected: false },
					{ name: 'public-high', args: [18], expected: true }
				],
				[{ name: 'hidden-older', args: [25], expected: true }],
				'Return the result of the comparison.'
			);
		case 'compareAtLeastTwoArgs':
		case 'compareTwoArgs':
			return unitFrom(
				def,
				`return ${def.compare}`,
				[
					{
						name: 'public-true',
						args: def.kind === 'compareAtLeastTwoArgs' ? [128, 256] : [8, 10],
						expected: true
					},
					{
						name: 'public-false',
						args: def.kind === 'compareAtLeastTwoArgs' ? [512, 256] : [12, 10],
						expected: false
					}
				],
				[
					{
						name: 'hidden-edge',
						args: def.kind === 'compareAtLeastTwoArgs' ? [256, 256] : [10, 10],
						expected: true
					}
				],
				'Return the boolean result of the comparison.'
			);
		case 'isWeekend':
			return unitFrom(
				def,
				`return ${def.param} == "Sat" or ${def.param} == "Sun"`,
				[
					{ name: 'public-sat', args: ['Sat'], expected: true },
					{ name: 'public-mon', args: ['Mon'], expected: false }
				],
				[{ name: 'hidden-sun', args: ['Sun'], expected: true }],
				'Use `or` so both weekend day names count.'
			);
		case 'sumList':
			return unitFrom(
				def,
				`total = 0\n    for ${def.itemName} in ${def.param}:\n        total = total + ${def.itemName}\n    return total`,
				[
					{ name: 'public-many', args: [[1, 2, 3]], expected: 6 },
					{ name: 'public-empty', args: [[]], expected: 0 }
				],
				[{ name: 'hidden-two', args: [[5, 5]], expected: 10 }],
				'Use a loop and a running total.'
			);
		case 'countAtLeast':
			return unitFrom(
				def,
				`count = 0\n    for ${def.itemName} in ${def.param}:\n        if ${def.itemName} >= ${def.threshold}:\n            count = count + 1\n    return count`,
				[
					{ name: 'public-mixed', args: [[5, 10, 12]], expected: 2 },
					{ name: 'public-none', args: [[1, 2, 3]], expected: 0 }
				],
				[{ name: 'hidden-all', args: [[10, 11]], expected: 2 }],
				'Loop through the list and count values that meet the condition.'
			);
		case 'repeatWord':
			return unitFrom(
				def,
				`result = ""\n    for _ in range(${def.params[1]}):\n        result = result + ${def.params[0]}\n    return result`,
				[
					{ name: 'public-two', args: ['ha', 2], expected: 'haha' },
					{ name: 'public-zero', args: ['go', 0], expected: '' }
				],
				[{ name: 'hidden-three', args: ['x', 3], expected: 'xxx' }],
				'Build the result with a loop.'
			);
		case 'getLastItem':
			return unitFrom(
				def,
				`return ${def.param}[-1]`,
				[
					{ name: 'public-words', args: [['axe', 'bow']], expected: 'bow' },
					{ name: 'public-numbers', args: [[1, 2, 3]], expected: 3 }
				],
				[{ name: 'hidden-one', args: [['solo']], expected: 'solo' }],
				'Use the last index.'
			);
		case 'countEvenList':
			return unitFrom(
				def,
				`count = 0\n    for ${def.itemName} in ${def.param}:\n        if ${def.itemName} % 2 == 0:\n            count = count + 1\n    return count`,
				[
					{ name: 'public-mixed', args: [[1, 2, 4]], expected: 2 },
					{ name: 'public-none', args: [[1, 3, 5]], expected: 0 }
				],
				[{ name: 'hidden-empty', args: [[]], expected: 0 }],
				'Use `% 2 == 0` inside a loop.'
			);
		case 'findSmallest':
			return unitFrom(
				def,
				`best = ${def.param}[0]\n    for ${def.itemName} in ${def.param}:\n        if ${def.itemName} < best:\n            best = ${def.itemName}\n    return best`,
				[
					{ name: 'public-three', args: [[5, 2, 9]], expected: 2 },
					{ name: 'public-negative', args: [[0, -1, 4]], expected: -1 }
				],
				[{ name: 'hidden-one', args: [[7]], expected: 7 }],
				'Track the best-so-far value while looping.'
			);
		case 'joinNames':
			return unitFrom(
				def,
				'return ", ".join(names)',
				[
					{ name: 'public-two', args: [['Ayla', 'Kai']], expected: 'Ayla, Kai' },
					{ name: 'public-one', args: [['Solo']], expected: 'Solo' }
				],
				[{ name: 'hidden-empty', args: [[]], expected: '' }],
				'Use `join()` with `", "` as the separator.'
			);
		case 'dictGetKey':
			return unitFrom(
				def,
				`return ${def.param}[${JSON.stringify(def.key)}]`,
				[
					{ name: 'public-basic', args: [{ score: 9 }], expected: 9 },
					{ name: 'public-zero', args: [{ score: 0 }], expected: 0 }
				],
				[{ name: 'hidden-large', args: [{ score: 42 }], expected: 42 }],
				'Look up the value for the requested key.'
			);
		case 'dictHasKey':
			return unitFrom(
				def,
				`return ${def.params[1]} in ${def.params[0]}`,
				[
					{ name: 'public-yes', args: [{ potion: 2 }, 'potion'], expected: true },
					{ name: 'public-no', args: [{ potion: 2 }, 'key'], expected: false }
				],
				[{ name: 'hidden-empty', args: [{}, 'potion'], expected: false }],
				'Use `in` to test for the key.'
			);
		case 'dictSumValues':
			return unitFrom(
				def,
				`total = 0\n    for value in ${def.param}.values():\n        total = total + value\n    return total`,
				[
					{ name: 'public-two', args: [{ potion: 2, key: 1 }], expected: 3 },
					{ name: 'public-empty', args: [{}], expected: 0 }
				],
				[{ name: 'hidden-many', args: [{ a: 3, b: 4 }], expected: 7 }],
				'Loop over `.values()` and build a total.'
			);
		case 'dictDescribe':
			return unitFrom(
				def,
				`return ${def.param}["name"] + " is level " + str(${def.param}["level"])`,
				[
					{ name: 'public-ayla', args: [{ name: 'Ayla', level: 3 }], expected: 'Ayla is level 3' },
					{ name: 'public-kai', args: [{ name: 'Kai', level: 7 }], expected: 'Kai is level 7' }
				],
				[{ name: 'hidden-zero', args: [{ name: 'Mira', level: 0 }], expected: 'Mira is level 0' }],
				'Read both values and format them into one string.'
			);
		case 'uniqueCount':
			return unitFrom(
				def,
				`return len(set(${def.param}))`,
				[
					{ name: 'public-dup', args: [['a', 'a', 'b']], expected: 2 },
					{ name: 'public-empty', args: [[]], expected: 0 }
				],
				[{ name: 'hidden-all-unique', args: [[1, 2, 3]], expected: 3 }],
				'Use a set to remove duplicates before counting.'
			);
		case 'hasDuplicates':
			return unitFrom(
				def,
				`return len(set(${def.param})) != len(${def.param})`,
				[
					{ name: 'public-yes', args: [[1, 1, 2]], expected: true },
					{ name: 'public-no', args: [[1, 2, 3]], expected: false }
				],
				[{ name: 'hidden-empty', args: [[]], expected: false }],
				'Compare the list length to the set length.'
			);
		case 'setIntersection':
			return unitFrom(
				def,
				`return ${def.params[0]} & ${def.params[1]}`,
				[
					{
						name: 'public-one',
						args: [new Set(['axe', 'bow']), new Set(['bow', 'staff'])],
						expected: new Set(['bow'])
					},
					{ name: 'public-none', args: [new Set(['axe']), new Set(['staff'])], expected: new Set() }
				],
				[
					{
						name: 'hidden-many',
						args: [new Set([1, 2, 3]), new Set([2, 3, 4])],
						expected: new Set([2, 3])
					}
				],
				'Use the set intersection operator `&`.'
			);
		case 'setDifference':
			return unitFrom(
				def,
				`return ${def.params[0]} - ${def.params[1]}`,
				[
					{
						name: 'public-some',
						args: [new Set(['bronze', 'silver']), new Set(['bronze'])],
						expected: new Set(['silver'])
					},
					{
						name: 'public-none',
						args: [new Set(['bronze']), new Set(['bronze'])],
						expected: new Set()
					}
				],
				[
					{
						name: 'hidden-many',
						args: [new Set(['a', 'b', 'c']), new Set(['b'])],
						expected: new Set(['a', 'c'])
					}
				],
				'Use set difference to remove already-owned values.'
			);
		case 'safeDivide':
			return unitFrom(
				def,
				`if ${def.params[1]} == 0:\n        return 0\n    return ${def.params[0]} / ${def.params[1]}`,
				[
					{ name: 'public-zero', args: [10, 0], expected: 0 },
					{ name: 'public-normal', args: [10, 2], expected: 5 }
				],
				[{ name: 'hidden-three', args: [9, 3], expected: 3 }],
				'Handle the zero case before dividing.'
			);
		case 'parseIntDefault':
			return unitFrom(
				def,
				`try:\n        return int(${def.param})\n    except ValueError:\n        return 0`,
				[
					{ name: 'public-valid', args: ['7'], expected: 7 },
					{ name: 'public-invalid', args: ['oops'], expected: 0 }
				],
				[{ name: 'hidden-zero', args: ['0'], expected: 0 }],
				'Use `try` and `except ValueError` to provide a safe fallback.'
			);
		case 'firstItemOrNone':
			return unitFrom(
				def,
				`if not ${def.param}:\n        return None\n    return ${def.param}[0]`,
				[
					{ name: 'public-non-empty', args: [[1, 2, 3]], expected: 1 },
					{ name: 'public-empty', args: [[]], expected: null }
				],
				[{ name: 'hidden-words', args: [['a', 'b']], expected: 'a' }],
				'Handle the empty list before reading index 0.'
			);
		case 'averageOrZero':
			return unitFrom(
				def,
				`if not ${def.param}:\n        return 0\n    total = 0\n    for ${def.itemName} in ${def.param}:\n        total = total + ${def.itemName}\n    return total / len(${def.param})`,
				[
					{ name: 'public-three', args: [[2, 4, 6]], expected: 4 },
					{ name: 'public-empty', args: [[]], expected: 0 }
				],
				[{ name: 'hidden-one', args: [[5]], expected: 5 }],
				'Handle the empty list, then compute the average normally.'
			);
		case 'filterAtLeast':
			return unitFrom(
				def,
				`result = []\n    for ${def.itemName} in ${def.params[0]}:\n        if ${def.itemName} >= ${def.params[1]}:\n            result.append(${def.itemName})\n    return result`,
				[
					{ name: 'public-some', args: [[1, 3, 5], 3], expected: [3, 5] },
					{ name: 'public-none', args: [[1, 2], 5], expected: [] }
				],
				[{ name: 'hidden-all', args: [[4, 5], 4], expected: [4, 5] }],
				'Build and return a new list of matching values.'
			);
		case 'topScore':
			return unitFrom(
				def,
				`if not ${def.param}:\n        return 0\n    best = ${def.param}[0]\n    for ${def.itemName} in ${def.param}:\n        if ${def.itemName} > best:\n            best = ${def.itemName}\n    return best`,
				[
					{ name: 'public-many', args: [[2, 9, 5]], expected: 9 },
					{ name: 'public-empty', args: [[]], expected: 0 }
				],
				[{ name: 'hidden-one', args: [[7]], expected: 7 }],
				'Track the largest value while looping.'
			);
		case 'canCraft':
			return unitFrom(
				def,
				`for item, needed in ${def.params[1]}.items():\n        if ${def.params[0]}.get(item, 0) < needed:\n            return False\n    return True`,
				[
					{
						name: 'public-yes',
						args: [
							{ wood: 3, ore: 2 },
							{ wood: 2, ore: 1 }
						],
						expected: true
					},
					{ name: 'public-no', args: [{ wood: 1 }, { wood: 2 }], expected: false }
				],
				[{ name: 'hidden-missing', args: [{ wood: 3 }, { wood: 2, ore: 1 }], expected: false }],
				'Use `.get(item, 0)` so missing items count as zero.'
			);
		default:
			throw new Error(`Unknown unit lesson kind: ${def.kind}`);
	}
};

const unitFrom = (def, body, publicCases, hiddenCases, assignment) => {
	const params = def.params ?? [def.param];
	const starter = `def ${def.functionName}(${params.join(', ')}):\n    # ${assignment}\n    return 0\n`;
	const solution = `def ${def.functionName}(${params.join(', ')}):\n    ${body}\n`;
	return {
		prompt: `Write \`${def.functionName}\` so it passes the tests.`,
		starter,
		solution,
		example: solution,
		publicCases,
		hiddenCases,
		assignment
	};
};

const buildFiles = (chapter, lessonIndex, modeIndex, def, mode) => {
	const slug = `${chapter.slug}-${mode}-${modeIndex}`;
	if (mode === 'quiz') {
		return {
			slug,
			files: {
				'lesson.json': JSON.stringify(
					{
						slug,
						order: lessonIndex,
						title: def.title,
						prompt: 'Choose the best answer.',
						mode,
						question: def.question,
						choices: def.choices,
						correctChoiceId: def.correctChoiceId
					},
					null,
					2
				),
				'readme.md': quizMd(def.title, def.concept)
			}
		};
	}

	if (mode === 'console') {
		const lesson = buildConsole(def);
		return {
			slug,
			files: {
				'lesson.json': JSON.stringify(
					{
						slug,
						order: lessonIndex,
						title: def.title,
						prompt: lesson.prompt,
						mode,
						publicCases: [{ name: 'public-main', stdin: '', expectedStdout: lesson.stdout }],
						hiddenCases: [{ name: 'hidden-main', stdin: '', expectedStdout: lesson.stdout }]
					},
					null,
					2
				),
				'readme.md': md(def.title, def.intro, lesson.example, lesson.assignment),
				'code.py': lesson.starter,
				'complete.py': lesson.solution
			}
		};
	}

	const lesson = buildUnit(def);
	return {
		slug,
		files: {
			'lesson.json': JSON.stringify(
				{
					slug,
					order: lessonIndex,
					title: def.title,
					prompt: lesson.prompt,
					mode,
					functionName: def.functionName,
					publicCases: lesson.publicCases,
					hiddenCases: lesson.hiddenCases
				},
				null,
				2
			),
			'readme.md': md(def.title, def.intro, lesson.example, lesson.assignment),
			'code.py': lesson.starter,
			'complete.py': lesson.solution,
			'main_test.py': unitTest(def.functionName, lesson.publicCases)
		}
	};
};

for (const chapter of chapters) {
	const plan = plans[chapter.slug];
	for (const mode of ['console', 'quiz', 'unit']) {
		const expected = chapter.counts[mode] ?? 0;
		const actual = plan[mode]?.length ?? 0;
		if (expected !== actual) {
			throw new Error(`${chapter.slug} expected ${expected} ${mode} lessons but found ${actual}`);
		}
	}
}

await rm(courseRoot, { recursive: true, force: true });
await mkdir(courseRoot, { recursive: true });

for (const chapter of chapters) {
	const chapterDir = path.join(courseRoot, `${pad(chapter.order)}-${chapter.slug}`);
	await writeText(
		path.join(chapterDir, 'chapter.json'),
		JSON.stringify(
			{
				slug: chapter.slug,
				order: chapter.order,
				title: chapter.title,
				description: chapter.description
			},
			null,
			2
		)
	);
	const counters = { console: 0, quiz: 0, unit: 0 };
	for (const [offset, mode] of modeSequence(chapter.counts).entries()) {
		counters[mode] += 1;
		const lessonIndex = offset + 1;
		const lesson = buildFiles(
			chapter,
			lessonIndex,
			counters[mode],
			plans[chapter.slug][mode][counters[mode] - 1],
			mode
		);
		const lessonDir = path.join(
			chapterDir,
			'lessons',
			`${pad(lessonIndex)}-${slugify(lesson.slug)}`
		);
		for (const [fileName, contents] of Object.entries(lesson.files)) {
			await writeText(path.join(lessonDir, fileName), contents);
		}
	}
}

console.log(`Generated ${chapters.length} chapters at ${courseRoot}`);
