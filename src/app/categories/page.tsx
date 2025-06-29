'use server';

import prisma from '@/lib/prisma';
import { CategoryForm } from '@/src/components/category/category-form';
import CategoryList from '@/src/components/category/cateogry-list';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Card, CardContent } from '@/src/components/ui/card';

export default async function Categories() {
  const categories = await prisma.category.findMany();
  return (
    <div className="p-6 w-full">
      <div className="mb-2">
        <Card className="bg-white p-2">
          <CardContent className="p-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="add-category">
                <AccordionTrigger className="text-xl font-semibold">
                  + Add New Category
                </AccordionTrigger>
                <AccordionContent>
                  <CategoryForm />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
