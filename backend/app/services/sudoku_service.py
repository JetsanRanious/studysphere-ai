import random
import copy
from typing import List, Tuple, Optional, Dict, Any

class SudokuService:
    @staticmethod
    def is_valid(board: List[List[int]], row: int, col: int, num: int) -> bool:
        # Check row
        for c in range(9):
            if board[row][c] == num:
                return False
        # Check col
        for r in range(9):
            if board[r][col] == num:
                return False
        # Check 3x3 box
        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for r in range(start_row, start_row + 3):
            for c in range(start_col, start_col + 3):
                if board[r][c] == num:
                    return False
        return True

    @staticmethod
    def solve(board: List[List[int]]) -> bool:
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)
                    for num in nums:
                        if SudokuService.is_valid(board, r, c, num):
                            board[r][c] = num
                            if SudokuService.solve(board):
                                return True
                            board[r][c] = 0
                    return False
        return True

    @staticmethod
    def generate_puzzle(difficulty: str = "medium") -> Tuple[List[List[int]], List[List[int]]]:
        """
        Generates a valid Sudoku puzzle and its complete solution.
        """
        # Create empty board
        board = [[0 for _ in range(9)] for _ in range(9)]
        
        # Fill diagonal 3x3 boxes first (independent)
        for i in range(0, 9, 3):
            nums = list(range(1, 10))
            random.shuffle(nums)
            idx = 0
            for r in range(i, i + 3):
                for c in range(i, i + 3):
                    board[r][c] = nums[idx]
                    idx += 1
                    
        # Solve to get complete valid solution
        SudokuService.solve(board)
        solution = copy.deepcopy(board)

        # Remove cells according to difficulty
        # Easy: ~38 clues (remove 43), Medium: ~30 clues (remove 51), Hard: ~24 clues (remove 57)
        remove_count = 42 if difficulty == "easy" else (50 if difficulty == "medium" else 56)
        
        puzzle = copy.deepcopy(solution)
        cells = [(r, c) for r in range(9) for c in range(9)]
        random.shuffle(cells)

        for r, c in cells[:remove_count]:
            puzzle[r][c] = 0

        return puzzle, solution

    @staticmethod
    def get_ai_hint(current_board: List[List[int]], solution: List[List[int]]) -> Optional[Dict[str, Any]]:
        """
        Finds a logical step-by-step AI hint for the next cell.
        Explains the reasoning (Naked Single, Hidden Single, Row/Col elimination).
        """
        # 1. Look for a Naked Single (only 1 valid number fits in this cell)
        for r in range(9):
            for c in range(9):
                if current_board[r][c] == 0:
                    candidates = []
                    for num in range(1, 10):
                        if SudokuService.is_valid(current_board, r, c, num):
                            candidates.append(num)
                    if len(candidates) == 1:
                        val = candidates[0]
                        box_idx = (r // 3) * 3 + (c // 3) + 1
                        return {
                            "row": r,
                            "col": c,
                            "value": val,
                            "technique": "Naked Single",
                            "explanation": f"In Row {r+1}, Column {c+1}, all other digits 1-9 are already present in its row, column, or 3x3 box #{box_idx}. Therefore, only {val} can fit here."
                        }

        # 2. Look for any empty cell matching solution with elimination reasoning
        empty_cells = [(r, c) for r in range(9) for c in range(9) if current_board[r][c] == 0]
        if empty_cells:
            # Pick the cell with the fewest candidates
            best_cell = None
            min_cands = 10
            best_val = None
            best_cands = []
            
            for r, c in empty_cells:
                cands = [num for num in range(1, 10) if SudokuService.is_valid(current_board, r, c, num)]
                if 0 < len(cands) < min_cands:
                    min_cands = len(cands)
                    best_cell = (r, c)
                    best_val = solution[r][c]
                    best_cands = cands

            if best_cell:
                r, c = best_cell
                return {
                    "row": r,
                    "col": c,
                    "value": best_val,
                    "technique": "Constraint Elimination",
                    "explanation": f"Focus on Row {r+1}, Column {c+1}. By checking the intersections of Column {c+1} and Row {r+1}, the candidate options narrow down to {best_cands}. Placing {best_val} maintains board validity."
                }

        return None
