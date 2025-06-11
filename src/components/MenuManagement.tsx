import React, { useState } from 'react';
import styled from 'styled-components';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  ingredients: Ingredient[];
  imageUrl: string;
  isActive: boolean;
}

const Container = styled.div`
  display: grid;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2D1B69;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #2D1B69;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #3d2589;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const MenuCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const MenuImage = styled.div<{ $imageUrl?: string }>`
  height: 200px;
  background-image: url(${props => props.$imageUrl || 'placeholder.jpg'});
  background-size: cover;
  background-position: center;
`;

const MenuContent = styled.div`
  padding: 1.5rem;
`;

const MenuName = styled.h3`
  color: #2D1B69;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`;

const MenuDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
`;

const MenuPrice = styled.div`
  color: #2D1B69;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const MenuFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CostInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background: ${props => props.$variant === 'delete' ? '#ff4d4f' : '#2D1B69'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2D1B69;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const IngredientsSection = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
`;

const IngredientList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const IngredientItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const emptyIngredient: Ingredient = {
    id: '',
    name: '',
    quantity: 0,
    unit: 'g',
    costPerUnit: 0
  };

  const calculateCost = (ingredients: Ingredient[]) => {
    return ingredients.reduce((total, ing) => total + (ing.quantity * ing.costPerUnit), 0);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const ingredients: Ingredient[] = [];
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    ingredientRows.forEach((row, index) => {
      ingredients.push({
        id: Date.now().toString() + index,
        name: formData.get(`ingredient-name-${index}`) as string,
        quantity: Number(formData.get(`ingredient-quantity-${index}`)),
        unit: formData.get(`ingredient-unit-${index}`) as string,
        costPerUnit: Number(formData.get(`ingredient-cost-${index}`))
      });
    });

    const menuItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      ingredients,
      imageUrl: formData.get('imageUrl') as string,
      isActive: true
    };

    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? menuItem : item
      ));
    } else {
      setMenuItems([...menuItems, menuItem]);
    }
    setShowModal(false);
  };

  return (
    <Container>
      <Header>
        <Title>Управление меню</Title>
        <AddButton onClick={handleAddItem}>
          + Добавить блюдо
        </AddButton>
      </Header>

      <MenuGrid>
        {menuItems.map(item => (
          <MenuCard key={item.id}>
            <MenuImage $imageUrl={item.imageUrl} />
            <MenuContent>
              <MenuName>{item.name}</MenuName>
              <MenuDescription>{item.description}</MenuDescription>
              <MenuPrice>{item.price} сом</MenuPrice>
              <MenuFooter>
                <CostInfo>
                  Себестоимость: {calculateCost(item.ingredients)} сом
                </CostInfo>
                <div>
                  <ActionButton onClick={() => handleEditItem(item)}>
                    Изменить
                  </ActionButton>
                  <ActionButton 
                    $variant="delete" 
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Удалить
                  </ActionButton>
                </div>
              </MenuFooter>
            </MenuContent>
          </MenuCard>
        ))}
      </MenuGrid>

      {showModal && (
        <Modal>
          <ModalContent>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Название блюда</Label>
                <Input 
                  name="name" 
                  required 
                  defaultValue={editingItem?.name}
                />
              </FormGroup>
              <FormGroup>
                <Label>Категория</Label>
                <Select 
                  name="category" 
                  required 
                  defaultValue={editingItem?.category}
                >
                  <option value="main">Основные блюда</option>
                  <option value="appetizer">Закуски</option>
                  <option value="dessert">Десерты</option>
                  <option value="drinks">Напитки</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Описание</Label>
                <TextArea 
                  name="description" 
                  required 
                  defaultValue={editingItem?.description}
                />
              </FormGroup>
              <FormGroup>
                <Label>Цена (сом)</Label>
                <Input 
                  type="number" 
                  name="price" 
                  required 
                  min="0" 
                  step="0.01"
                  defaultValue={editingItem?.price}
                />
              </FormGroup>
              <FormGroup>
                <Label>URL изображения</Label>
                <Input 
                  type="url" 
                  name="imageUrl" 
                  required 
                  defaultValue={editingItem?.imageUrl}
                />
              </FormGroup>
              
              <IngredientsSection>
                <Label>Ингредиенты</Label>
                <IngredientList>
                  {(editingItem?.ingredients || [emptyIngredient]).map((ing, index) => (
                    <IngredientItem key={index} className="ingredient-row">
                      <Input
                        name={`ingredient-name-${index}`}
                        placeholder="Название"
                        defaultValue={ing.name}
                        required
                      />
                      <Input
                        type="number"
                        name={`ingredient-quantity-${index}`}
                        placeholder="Количество"
                        defaultValue={ing.quantity}
                        required
                        min="0"
                        step="0.01"
                      />
                      <Select
                        name={`ingredient-unit-${index}`}
                        defaultValue={ing.unit}
                        required
                      >
                        <option value="g">г</option>
                        <option value="ml">мл</option>
                        <option value="pcs">шт</option>
                      </Select>
                      <Input
                        type="number"
                        name={`ingredient-cost-${index}`}
                        placeholder="Цена за ед."
                        defaultValue={ing.costPerUnit}
                        required
                        min="0"
                        step="0.01"
                      />
                      <ActionButton 
                        type="button"
                        $variant="delete"
                        onClick={() => {
                          const list = document.querySelector('.ingredient-row');
                          if (list && list.children.length > 1) {
                            list.removeChild(list.children[index]);
                          }
                        }}
                      >
                        Удалить
                      </ActionButton>
                    </IngredientItem>
                  ))}
                </IngredientList>
                <ButtonGroup>
                  <ActionButton
                    type="button"
                    onClick={() => {
                      const list = document.querySelector('.ingredient-row');
                      if (list) {
                        const newRow = list.cloneNode(true) as HTMLElement;
                        const inputs = newRow.querySelectorAll('input');
                        inputs.forEach(input => input.value = '');
                        const selects = newRow.querySelectorAll('select');
                        selects.forEach(select => select.value = 'g');
                        list.parentNode?.appendChild(newRow);
                      }
                    }}
                  >
                    + Добавить ингредиент
                  </ActionButton>
                </ButtonGroup>
              </IngredientsSection>

              <ButtonGroup>
                <ActionButton 
                  type="button" 
                  $variant="delete" 
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </ActionButton>
                <ActionButton type="submit">
                  {editingItem ? 'Сохранить' : 'Добавить'}
                </ActionButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default MenuManagement; 