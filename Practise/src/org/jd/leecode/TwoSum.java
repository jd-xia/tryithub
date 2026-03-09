/*
 * id: TwoSum.java 2026-03-09 12:53:54 Xiajiandao*
 */
package org.jd.leecode;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * LeetCode 1: Two Sum.
 * <p>
 * Given an array of integers {@code nums} and an integer {@code target}, returns indices of the
 * two numbers that add up to {@code target}. Exactly one solution is assumed; the same element
 * may not be used twice.
 * <p>
 * <b>Approach:</b> One-pass hash map. For each number, we check if its complement
 * ({@code target - nums[i]}) is already in the map. If yes, we have found the pair; otherwise we
 * store the current number and its index for future lookups. Time O(n), space O(n).
 */
public class TwoSum {

    /**
     * Finds two indices in {@code nums} whose values sum to {@code target}.
     *
     * @param nums   array of integers (no duplicate indices used)
     * @param target target sum
     * @return array of two indices {@code [i, j]} such that {@code nums[i] + nums[j] == target},
     *         or {@code [-1, -1]} if no such pair exists
     */
    public static int[] twoSum(int[] nums, int target) {

	    // value -> index; used to look up "complement" in O(1)
	    Map<Integer, Integer> map = new HashMap<>();

	    for (int i = 0; i < nums.length; i++) {

	        int complement = target - nums[i];

	        if (map.containsKey(complement)) {
	            return new int[]{map.get(complement), i};
	        }

	        map.put(nums[i], i);
	    }

	    return new int[]{-1, -1};
	}

    public static void main(String[] args) {

	int[] nums = new int[] {3,3};
	System.out.println(Arrays.toString(twoSum(nums, 6)));
    }
}
