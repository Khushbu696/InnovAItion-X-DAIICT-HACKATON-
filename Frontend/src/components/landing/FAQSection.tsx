import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { GlassCard } from '@/components/ui/GlassCard';

const faqs = [
  {
    question: 'What is CloudArchitect?',
    answer: 'CloudArchitect is a visual infrastructure design tool that allows you to design cloud architectures by dragging and dropping AWS resources. The tool automatically generates Terraform code in real-time, making it easy to create production-ready infrastructure without writing code manually.',
  },
  {
    question: 'How does the drag-and-drop interface work?',
    answer: 'Simply drag AWS resources from the sidebar onto the canvas to design your architecture. You can connect resources, configure their properties, and see your Terraform code update automatically as you build. The interface is intuitive and requires no prior coding experience.',
  },
  {
    question: 'Can I edit the generated Terraform code?',
    answer: 'Yes! CloudArchitect supports bi-directional sync. You can edit either the visual diagram or the Terraform code directly, and both will stay in sync. This gives you the flexibility to fine-tune your infrastructure as needed.',
  },
  {
    question: 'What AWS resources are supported?',
    answer: 'CloudArchitect supports a wide range of AWS resources including EC2 instances, VPCs, RDS databases, S3 buckets, Lambda functions, API Gateway, and many more. We continuously add support for additional AWS services.',
  },
  {
    question: 'Can I deploy directly to AWS?',
    answer: 'Yes! CloudArchitect includes one-click deployment functionality. Once you\'re satisfied with your architecture design, you can deploy it directly to your AWS account with automated state management.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We take security seriously. All your projects and data are encrypted, and we follow industry best practices for data protection. You have full control over your infrastructure designs and can export your Terraform code at any time.',
  },
  {
    question: 'Do I need AWS credentials to use CloudArchitect?',
    answer: 'You can design and generate Terraform code without AWS credentials. However, to deploy your infrastructure to AWS, you\'ll need to provide your AWS credentials securely through our deployment interface.',
  },
  {
    question: 'Is CloudArchitect free to use?',
    answer: 'CloudArchitect offers a free tier for getting started. For advanced features and production deployments, we offer various pricing plans. Check our pricing page for more details.',
  },
];

const FAQSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently Asked
              <span className="gradient-text"> Questions</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about CloudArchitect and how it works.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-glass-border">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
