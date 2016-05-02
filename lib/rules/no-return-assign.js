/**
 * @fileoverview Rule to flag when return statement contains assignment
 * @author Ilya Volodin
 */
"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var SENTINEL_TYPE = /^(?:[a-zA-Z]+?Statement|ArrowFunctionExpression|FunctionExpression|ClassExpression)$/;

/**
 * Checks whether or not a node is enclosed in parentheses.
 * @param {Node|null} node - A node to check.
 * @param {RuleContext} context - The current context.
 * @returns {boolean} Whether or not the node is enclosed in parentheses.
 */
function isEnclosedInParens(node, context) {
    var prevToken = context.getTokenBefore(node);
    var nextToken = context.getTokenAfter(node);

    return prevToken.value === "(" && nextToken.value === ")";
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "disallow assignment operators in `return` statements",
            category: "Best Practices",
            recommended: false
        },

        schema: [
            {
                enum: ["except-parens", "always"]
            }
        ]
    },

    create: function(context) {
        var always = (context.options[0] || "except-parens") !== "except-parens";

        return {
            AssignmentExpression: function(node) {
                if (!always && isEnclosedInParens(node, context)) {
                    return;
                }

                var parent = node.parent;

                // Find ReturnStatement or ArrowFunctionExpression in ancestors.
                while (parent && !SENTINEL_TYPE.test(parent.type)) {
                    node = parent;
                    parent = parent.parent;
                }

                // Reports.
                if (parent && parent.type === "ReturnStatement") {
                    context.report({
                        node: parent,
                        message: "Return statement should not contain assignment."
                    });
                } else if (parent && parent.type === "ArrowFunctionExpression" && parent.body === node) {
                    context.report({
                        node: parent,
                        message: "Arrow function should not return assignment."
                    });
                }
            }
        };
    }
};
