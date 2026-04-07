import type { UnitCase } from './types';

const escapePythonString = (value: string) =>
	value
		.replaceAll('\\', '\\\\')
		.replaceAll("'", "\\'")
		.replaceAll('\n', '\\n')
		.replaceAll('\r', '\\r')
		.replaceAll('\t', '\\t');

const toPythonLiteral = (value: unknown): string => {
	if (typeof value === 'string') {
		return `'${escapePythonString(value)}'`;
	}

	if (typeof value === 'number' || typeof value === 'bigint') {
		return String(value);
	}

	if (typeof value === 'boolean') {
		return value ? 'True' : 'False';
	}

	if (value === null) {
		return 'None';
	}

	if (Array.isArray(value)) {
		const items = value.map((item) => toPythonLiteral(item));
		return `[${items.join(', ')}]`;
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>).map(
			([key, entryValue]) => `${toPythonLiteral(key)}: ${toPythonLiteral(entryValue)}`
		);
		return `{${entries.join(', ')}}`;
	}

	return 'None';
};

const toCaseTupleLiteral = ({ args, expected }: UnitCase) => {
	const values = [...args, expected].map((value) => toPythonLiteral(value));
	return `    (${values.join(', ')}),`;
};

const toCaseListLiteral = (cases: UnitCase[]) =>
	cases.length > 0 ? cases.map((testCase) => toCaseTupleLiteral(testCase)).join('\n') : '';

export const renderUnitTestFile = ({
	functionName,
	publicCases,
	hiddenCases
}: {
	functionName: string;
	publicCases: UnitCase[];
	hiddenCases: UnitCase[];
}) => `from main import *

run_cases = [
${toCaseListLiteral(publicCases)}
]

submit_cases = run_cases + [
${toCaseListLiteral(hiddenCases)}
]


def format_inputs(inputs):
    return ", ".join(repr(value) for value in inputs)


def test_case(*case):
    *inputs, expected_output = case
    print("---------------------------------")
    print(f"Inputs: {format_inputs(inputs)}")

    try:
        result = ${functionName}(*inputs)
    except Exception as error:
        print(f"Error:    {error}")
        print("Fail")
        return False

    print(f"Expected: {expected_output!r}")
    print(f"Actual:   {result!r}")
    if result == expected_output:
        print("Pass")
        return True

    print("Fail")
    return False


def main():
    passed = 0
    failed = 0
    skipped = len(submit_cases) - len(test_cases)

    for test_case_data in test_cases:
        if test_case(*test_case_data):
            passed += 1
        else:
            failed += 1

    if failed == 0:
        print("============= PASS ==============")
    else:
        print("============= FAIL ==============")

    if skipped > 0:
        print(f"{passed} passed, {failed} failed, {skipped} skipped")
    else:
        print(f"{passed} passed, {failed} failed")

    return 0 if failed == 0 else 1


test_cases = submit_cases
if "__RUN__" in globals():
    test_cases = run_cases


raise SystemExit(main())
`;
