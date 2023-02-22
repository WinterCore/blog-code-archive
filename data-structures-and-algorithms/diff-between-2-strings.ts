import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

function calculateDiffBruteForce(source: string, target: string, si = 0, ti = 0): string[] {
    if (si >= source.length) {
        return target.split("").slice(ti).map(x => `+${x}`);
    }

    if (ti >= target.length) {
        return source.split("").slice(si).map(x => `-${x}`);
    }

    if (source[si] === target[ti]) {
        return [target[ti], ...calculateDiffBruteForce(source, target, si + 1, ti + 1)];
    }

    const removalPath = [`-${source[si]}`, ...calculateDiffBruteForce(source, target, si + 1, ti)];
    const insertionPath = [`+${target[ti]}`, ...calculateDiffBruteForce(source, target, si, ti + 1)];

    return removalPath.length <= insertionPath.length
        ? removalPath
        : insertionPath;
}



function calculateDiffDp(source: string, target: string): string[] {
    // We're gonna have the source on the X axis and the target on the Y axis
    const dp: number[][] = Array
        .from({ length: target.length + 1 })
        .map(() => Array.from({ length: source.length + 1 }));

    // Initialize base X axis
    for (let i = 0; i <= source.length; i += 1) {
        dp[0][i] = i;
    }

    for (let i = 0; i <= target.length; i += 1) {
        dp[i][0] = i;
    }

    // Fill the distances
    for (let ti = 1; ti <= target.length; ti += 1) {
        for (let si = 1; si <= source.length; si += 1) {
            if (target[ti - 1] === source[si - 1]) {
                dp[ti][si] = dp[ti - 1][si - 1] + 1;
            } else {
                let min = Math.min(dp[ti - 1][si], dp[ti][si - 1]);
                dp[ti][si] = min + 1;
            }
        }
    }

    const edits: string[] = [];

    let ti = target.length;
    let si = source.length;

    while (ti > 0 && si > 0) {
        const up = dp[ti - 1][si];
        const left = dp[ti][si - 1];

        if (source[si - 1] === target[ti - 1]) {
            const upLeft = dp[ti - 1][si - 1];

            if (upLeft < up && upLeft < left) {
                edits.unshift(target[ti - 1]);
                ti -= 1;
                si -= 1;

                continue;
            }
        }

        if (up <= left) {
            edits.unshift(`+${target[ti - 1]}`);
            ti -= 1;
        } else {
            edits.unshift(`-${source[si - 1]}`);
            si -= 1;
        }
    }

    if (si > 0) {
        edits.unshift(...source.split("").slice(0, si).map(x => `-${x}`));
    }

    if (ti > 0) {
        edits.unshift(...target.split("").slice(0, ti).map(x => `+${x}`));
    }

    // Construct the edits array

    return edits;
}


/**
 * Tests
 */
Deno.test("Diff between 2 strings tests", () => {
    interface ITestCase {
        readonly input: [string, string];
        readonly expected: string[];
    }

    const TEST_CASES: ReadonlyArray<ITestCase> = [
        // Identical strings
        {
            input: ["ABC", "ABC"],
            expected: ["A", "B",  "C"],
        },

        // Empty strings
        {
            input: ["", ""],
            expected: [],
        },
        {
            input: ["AB", ""],
            expected: ["-A", "-B"],
        },
        {
            input: ["", "AB"],
            expected: ["+A", "+B"],
        },

        // Random example 1
        {
            input: ["ABCDEFG", "ABDFFGH"],
            expected: ["A", "B",  "-C", "D", "-E", "F", "+F", "G",  "+H"],
        },
        {
            input: ["GEEK", "GESEK"],
            expected: ["G", "E", "+S", "E", "K"],
        },
    ];

    console.log("%cTesting DP solution...\n", "font-weight: bold");
    for (const testCase of TEST_CASES) {
        const { input: [source, target], expected } = testCase;

        // If you wanna test the brute force solution, just comment/uncomment the following 2 lines
        const solution = calculateDiffDp(source, target);
        // const solution = calculateDiffBruteForce(source, target);

        console.log(`%cTest: source = "${source}", target = "${target}"`, "color: yellow");
        assertEquals(solution, expected);
        console.log(solution.join(" "));
        console.log("%cPASS\n", "color: green");
    }
});

