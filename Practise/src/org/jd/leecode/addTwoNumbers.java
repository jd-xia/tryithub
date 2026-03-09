package org.jd.leecode;

import org.jd.leecode.util.ListNode;

public class addTwoNumbers {

    public static void main(String[] args) {
	// Example: 342 + 465 = 807 ([2 -> 4 -> 3] + [5 -> 6 -> 4])
	int[] list1 = { 2, 4, 3 ,9};
	int[] list2 = { 5, 6, 4 };

	ListNode l1 = createList(list1);
	ListNode l2 = createList(list2);

	System.out.print("Input l1: ");
	printList(l1);

	System.out.print("Input l2: ");
	printList(l2);

	ListNode sum = addTwoNumbers(l1, l2);

	System.out.print("Sum: ");
	printList(sum);
    }


    // Suggested by AI
    public static ListNode addTwoNumbers_AI(ListNode l1, ListNode l2) {
	    ListNode dummy = new ListNode(0); // Dummy head to simplify code
	    ListNode curr = dummy;
	    int carry = 0;

	    while (l1 != null || l2 != null || carry != 0) {
	        int sum = carry;
	        if (l1 != null) {
	            sum += l1.val;
	            l1 = l1.next;
	        }
	        if (l2 != null) {
	            sum += l2.val;
	            l2 = l2.next;
	        }

	        curr.next = new ListNode(sum % 10); // Create new node with current digit
	        carry = sum / 10;                   // Update carry
	        curr = curr.next;                   // Move current pointer
	    }

	    return dummy.next; // Skip dummy head
	}
    
    
    // Coded by Xiajiandao 
    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {

        

	ListNode result = new ListNode();

	ListNode curr = result;

	int remaining = 0;
	
	// Check values of l1, l2, and remaining before processing in loop
	// (For debugging; can be removed in production)
	// Example: System.out.printf("l1: %s, l2: %s, remaining: %d\n", 
	//     l1 != null ? l1.val : null, 
	//     l2 != null ? l2.val : null, 
	//     remaining);

	while (l1 != null || l2 != null||remaining ==1) {

	    int l1Value = 0;
	    if (l1 != null) {
		l1Value = l1.val;
	    }

	    int l2Value = 0;
	    if (l2 != null) {
		l2Value = l2.val;
	    }

	    // Add values and check if more than 10 or less than 10. 
	    int value = l1Value + l2Value + remaining;
	    if (value < 10) {
		curr.val = value;
		remaining = 0;

	    } else {
		curr.val = value - 10;
		remaining = 1;
	    }

	    // Prepare the next Node, if needed.   
	    if(l1!=null) {
		l1 = l1.next;
	    }else {
		l1 = null;
	    }
	    
	    // Prepare the next Node, if needed.   
	    if(l2!=null) {
		l2 = l2.next;   // Move to next node in l2  
	    }else {
		l2 = null;      // Set l2 to null if it is the last node
	    }           // No need to check l1, as it will be null if l2 is null
	    
	    
	    
	    if (l1 != null || l2 != null||remaining ==1) {
		curr.next = new ListNode();
		curr = curr.next;
	    }
	}


	return result;
    }

    // Helper: Import ListNode
    // Since we can't import at this point, assume ListNode is in the current
    // package or imported externally

    // Helper method to create a linked list from an array
    private static ListNode createList(int[] vals) {
	if (vals == null || vals.length == 0)
	    return null;
	ListNode head = new ListNode(vals[0]);
	ListNode curr = head;
	for (int i = 1; i < vals.length; i++) {
	    curr.next = new ListNode(vals[i]);
	    curr = curr.next;
	}
	return head;
    }

    // Helper method to print a linked list
    private static void printList(ListNode node) {
	while (node != null) {
	    System.out.print(node.val);
	    if (node.next != null)
		System.out.print(" -> ");
	    node = node.next;
	}
	System.out.println();
    }

}
