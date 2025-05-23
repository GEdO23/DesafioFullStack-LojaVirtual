const prisma = require('../models/PrismaService');

class CartController {

    static async addProduct(req, res) {
        const { username, productId, quantity } = req.body;

        try {
            // Verificar o usuario
            const user = await prisma.user.findFirst({
                where: {
                    username
                }
            })

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            // Verifica se o produto existe
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            // Verifica se o item já existe no carrinho
            const existingItem = await prisma.cartItem.findFirst({
                where: {
                    userId: user.id,
                    productId
                }
            });

            if (existingItem) {
                // attualiza a quantidade
                const updatedItem = await prisma.cartItem.update({
                    where: {
                        id: existingItem.id
                    },
                    data: {
                        quantity: existingItem.quantity + quantity
                    }
                });

                return res.json({ message: 'Quantidade atualizada no carrinho', item: updatedItem });
            }

            // Colocar um novo item no carringo (cartItem)
            const newItem = await prisma.cartItem.create({
                data: {
                    userId: user.id,
                    productId,
                    quantity
                }
            });

            return res.json(newItem)

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' });
        }
        return;
    }

    static async viewCart(req, res) {
        const { username } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                username
            }
        })
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const products = await prisma.cartItem.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                quantity: true,
                productId: true,
                userId: true,
                produto: { // Mnadar produto front
                    select: {
                        name: true,
                        price: true,
                        description: true,
                    }
                }
            }
        })

        res.json(products)
    }

    static async deleteProduct(req, res) {
        // Deletar o produto do carrinho
        const { productId, userId } = req.params

        try {
            const deleteProduct = await prisma.cartItem.deleteMany({
                where: {
                    userId: parseInt(userId),
                    productId: parseInt(productId)
                }
            })

            res.json(deleteProduct)
        } catch(error){
            res.status(500).json({ error: "Erro ao deletar produto do carrinho" });
        }
    }

    static async updateQuantity(req, res) {
        const { productId, userId } = req.params;
        const { quantity } = req.body;

        try {
            const cartItem = await prisma.cartItem.findFirst({
                where: {
                    productId: parseInt(productId),
                    userId: parseInt(userId)
                }
            });

            const updatedItem = await prisma.cartItem.update({
                where: {
                    id: cartItem.id 
                },
                data: {
                    quantity: parseInt(quantity) 
                }
            });

            if (updatedItem[0] === 0) {
                return res.status(404).json({ message: 'Produto não encontrado no carrinho.' });
            }

            res.json({ message: 'Quantidade atualizada com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao atualizar a quantidade.' });
        }
    }
}

module.exports = CartController;