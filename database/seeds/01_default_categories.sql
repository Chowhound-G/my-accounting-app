-- 默认分类数据
-- 在用户注册时，可以为每个新用户插入这些默认分类

-- 收入分类
INSERT INTO categories (user_id, name, type, icon, is_default) VALUES
(1, '工资', 'income', '💰', true),
(1, '奖金', 'income', '🎁', true),
(1, '投资收益', 'income', '📈', true),
(1, '兼职', 'income', '💼', true),
(1, '其他收入', 'income', '💵', true);

-- 支出分类
INSERT INTO categories (user_id, name, type, icon, is_default) VALUES
(1, '餐饮', 'expense', '🍔', true),
(1, '交通', 'expense', '🚗', true),
(1, '购物', 'expense', '🛍️', true),
(1, '娱乐', 'expense', '🎮', true),
(1, '医疗', 'expense', '💊', true),
(1, '教育', 'expense', '📚', true),
(1, '住房', 'expense', '🏠', true),
(1, '通讯', 'expense', '📱', true),
(1, '其他支出', 'expense', '📝', true);

-- 注意：这里的 user_id = 1 需要根据实际用户 ID 替换
-- 在实际应用中，应该在用户注册时动态插入这些分类
